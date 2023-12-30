import "./App.css";
import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [characters, setCharacters] = useState<any[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkedNames, setCheckedNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let allCharacters: any[] = [];
        let nextPage = 1;

        while (true) {
          const response = await axios.get(
            `https://rickandmortyapi.com/api/character/?page=${nextPage}`
          );

          if (response.data.results && response.data.results.length > 0) {
            allCharacters = allCharacters.concat(response.data.results);
          }

          if (response.data.info && response.data.info.next) {
            nextPage++;
          } else {
            break; // No more pages
          }
        }

        setCharacters(allCharacters);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text
      .split(regex)
      .map((part, index) =>
        regex.test(part) ? <mark key={index}>{part}</mark> : part
      );
  };

  const handleCharacterSelect = (character: any) => {
    const characterName = character.name;

    // Toggle the checked status of the character
    if (checkedNames.includes(characterName)) {
      setCheckedNames(checkedNames.filter((name) => name !== characterName));
    } else {
      setCheckedNames([...checkedNames, characterName]);
    }

    setSelectedCharacter(character);
    setSearchQuery("");
  };

  const handleRemoveCheckedName = (name: string) => {
    setCheckedNames(checkedNames.filter((checkedName) => checkedName !== name));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLDivElement>) => {
    setSearchQuery(e.currentTarget.textContent || "");
  };

  // const handleClearCheckedNames = () => {
  //   setCheckedNames([]);
  // };

  return (
    <div>
      <h1>Rick and Morty Characters</h1>
      <div
        contentEditable
        style={{
          border: "1px solid #ccc",
          padding: "5px",
          borderRadius: "3px",
          minHeight: "30px",
        }}
        onInput={handleInputChange}
      >
        {checkedNames.map((name) => (
          <span key={name} style={{ margin: "0 5px", display: "inline-block" }}>
            {name}
            <button
              onClick={() => handleRemoveCheckedName(name)}
              style={{ marginLeft: "5px", cursor: "pointer" }}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <div>
        <h2>Search Results</h2>
        <div>
          {characters
            .filter((character) =>
              character.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((character) => (
              <div
                key={character.id}
                onClick={() => handleCharacterSelect(character)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checkedNames.includes(character.name)}
                  />
                  <img
                    src={character.image}
                    alt={character.name}
                    style={{
                      width: "50px",
                      height: "50px",
                      marginRight: "10px",
                    }}
                  />
                  <div>
                    {highlightSearchTerm(character.name, searchQuery)}
                    <br />
                    {character.episode.length} Episodes
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div>
        <h2>Selected Character</h2>
        {selectedCharacter && (
          <div>
            <h3>{selectedCharacter.name}</h3>
            <img src={selectedCharacter.image} alt={selectedCharacter.name} />
            <p>Status: {selectedCharacter.status}</p>
            <p>Species: {selectedCharacter.species}</p>
            {/* Add more details as needed */}
          </div>
        )}
      </div>
      {checkedNames.length > 0 && (
        <div>
          {checkedNames.map((name) => (
            <button key={name} onClick={() => handleRemoveCheckedName(name)}>
              {name} &times;
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default App;
