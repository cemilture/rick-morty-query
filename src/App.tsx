import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allCharacters: Character[] = [];
        let nextPage = 1;

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
            break; // No more pages
          }
        }

        setCharacters(allCharacters);
        setTotalPages(Math.ceil(allCharacters.length / cardsPerPage));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Recalculate total pages based on the characters matching the search query
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

    // Toggle the checked status of the character
    if (checkedNames.includes(characterName)) {
      setCheckedNames(checkedNames.filter((name) => name !== characterName));
    } else {
      setCheckedNames([...checkedNames, characterName]);
    }
  };

  const handleRemoveCheckedName = (name: string) => {
    setCheckedNames(checkedNames.filter((checkedName) => checkedName !== name));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const caretPosition = window.getSelection()?.getRangeAt(0).startOffset || 0;

    if (
      e.key === "Backspace" &&
      caretPosition === 0 &&
      checkedNames.length > 0
    ) {
      e.preventDefault(); // Prevent the default backspace behavior
      const lastCheckedName = checkedNames[checkedNames.length - 1];
      handleRemoveCheckedName(lastCheckedName);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    setSearchQuery(e.currentTarget.textContent || "");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const cardsPerPage = 8;

  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;

  return (
    <div className="container">
      <h1 className="header">Rick and Morty Characters</h1>
      <div
        className="editable-container"
        id="editableDiv"
        contentEditable
        onKeyDown={handleInputKeyDown}
        onInput={handleInputChange}
      >
        {checkedNames.map((name) => (
          <span className="checkedNames" key={name}>
            {name}
            <button onClick={() => handleRemoveCheckedName(name)}>
              &times;
            </button>
          </span>
        ))}
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
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="paginationButton"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="paginationButton"
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
