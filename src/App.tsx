import "./App.css";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import LoadingSkeleton from "./LoadingSkeleton";

interface Character {
  id: number;
  name: string;
  image: string;
  episode: string[];
}

function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedNames, setCheckedNames] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const searchInputRef = useRef<HTMLInputElement>(null); // Ref for search input

  useEffect(() => {
    const fetchData = async () => {
      try {
        // await new Promise((resolve) => setTimeout(resolve, 150000)); for skeleton

        let allCharacters: Character[] = [];
        let nextPage = 1;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const response = await axios.get(
            `https://rickandmortyapi.com/api/character/?page=${nextPage}`
          );

          if (response.data.results) {
            allCharacters = allCharacters.concat(response.data.results);
          }

          if (response.data.info && response.data.info.next) {
            nextPage++;
          } else {
            break;
          }
        }

        setCharacters(allCharacters);
        setTotalPages(Math.ceil(allCharacters.length / cardsPerPage));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setTotalPages(
      Math.ceil(
        characters.filter((character) =>
          character.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).length / cardsPerPage
      )
    );
  }, [characters, searchQuery]);
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text
      .split(regex)
      .map((part, index) =>
        regex.test(part) ? <strong key={index}>{part}</strong> : part
      );
  };

  const handleCharacterSelect = (character: Character) => {
    const characterName = character.name;

    if (checkedNames.includes(characterName)) {
      setCheckedNames(checkedNames.filter((name) => name !== characterName));
    } else {
      setCheckedNames([...checkedNames, characterName]);
    }
  };

  const handleRemoveCheckedName = (name: string) => {
    setCheckedNames(checkedNames.filter((checkedName) => checkedName !== name));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e);

    setSearchQuery(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleEditableContainerClick = () => {
    // Redirect focus to the search input when editable-container is clicked
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const cardsPerPage = 8;
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;

  return (
    <div className="container">
      <h1 className="header">Search Rick and Morty Characters</h1>
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div
            className="search-input-container"
            id="editableDiv"
            onClick={handleEditableContainerClick}
          >
            {checkedNames.map((name) => (
              <span className="checked-names" key={name}>
                {name}
                <button onClick={() => handleRemoveCheckedName(name)}>
                  &times;
                </button>
              </span>
            ))}
            <input
              className="search-input"
              ref={searchInputRef}
              type="text"
              onChange={handleInputChange}
              placeholder="Search characters..."
            />
          </div>

          <div className="results-container">
            {characters
              .filter((character) =>
                character.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(startIndex, endIndex)
              .map((character) => (
                <div
                  className="results-cards"
                  key={character.id}
                  onClick={() => handleCharacterSelect(character)}
                >
                  <input
                    type="checkbox"
                    checked={checkedNames.includes(character.name)}
                  />
                  <img src={character.image} alt={character.name} />
                  <div>
                    {highlightSearchTerm(character.name, searchQuery)}
                    <br />
                    {character.episode.length} Episodes
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
