import { useEffect, useRef, useState } from "react";
import "./App.css";
import Food from "./components/Food";
import Snake from "./components/Snake";

const randomFoodPosition = () => {
  const pos = { x: 0, y: 0 };
  let x = Math.floor(Math.random() * 96);
  let y = Math.floor(Math.random() * 96);
  pos.x = x - (x % 4);
  pos.y = y - (y % 4);
  return pos;
};

const initialSnake = {
  snake: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 8, y: 0 },
  ],
  direction: "d",
  speed: 100,
};

function App() {
  const [snake, setSnake] = useState(initialSnake.snake);
  const [lastDirection, setLastDirection] = useState(initialSnake.direction);
  const [foodArray, setFoodArray] = useState([
    randomFoodPosition(),
    randomFoodPosition()
  ]);
  const [blueFood, setBlueFood] = useState(null);
  const [greyFood, setGreyFood] = useState([]);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem("snake_highscore")) || 0;
  });
  const [isStarted, setIsStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(initialSnake.speed);
  const playgroundRef = useRef();

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const head = snake[snake.length - 1];

    const interval = setInterval(move, speed);

    return () => clearInterval(interval);
  }, [isStarted, gameOver, snake, speed, foodArray, blueFood, greyFood]);

  const move = () => {
    const tmpSnake = [...snake];
    let x = tmpSnake[tmpSnake.length - 1].x,
        y = tmpSnake[tmpSnake.length - 1].y;
    switch (lastDirection) {
      case "w":
      case "W":
        y -= 4;
        break;
      case "d":
      case "D":
        x += 4;
        break;
      case "s":
      case "S":
        y += 4;
        break;
      case "a":
      case "A":
        x -= 4;
        break;
      default:
        break;
    }

    if (x > 96) x = 0;
    if (x < 0) x = 96;
    if (y > 96) y = 0;
    if (y < 0) y = 96;

    // high score check variables
    const finalScore = tmpSnake.length - 3;
    let newHighScore = (finalScore > highScore);
    if (newHighScore) {
      setHighScore(finalScore);
      localStorage.setItem("snake_highscore", finalScore.toString());
    }

    // snake tail-biting
    const hitSelf = snake.some((segment) => segment.x === x && segment.y === y);

    if (hitSelf) {
      setGameOver(true);
      setIsStarted(false);
      return;
    }

    // rock hitting
    const hitRock = greyFood.some((rock) => x === rock.x && y === rock.y);

    if (hitRock) {
      setGameOver(true);
      setIsStarted(false);
      return;
    }

    tmpSnake.push({
      x,
      y,
    });

    // food logic

    const currentScore = tmpSnake.length - 3;

    if (blueFood && x === blueFood.x && y === blueFood.y) {
      setSpeed(initialSnake.speed + 50);
      setBlueFood(null);

    }

    else {

      const eatenFoodIndex = foodArray.findIndex(
          (food) => x === food.x && y === food.y
      );

      if (eatenFoodIndex === -1) {
        // if the head matches no apple position
        tmpSnake.shift(); // didn't eat anything. keep going as normal
      } else {
        // if the snake ate an apple

        // create copy of food array
        const newFoodArray = [...foodArray];
        // replace eaten apple with new random position apple
        newFoodArray[eatenFoodIndex] = randomFoodPosition();
        // update state to redraw new apple layout
        setFoodArray(newFoodArray);

        // speed up and score tracking code

        if (currentScore > 0 && currentScore % 2 === 0) {
          setSpeed((prevSpeed) => Math.max(prevSpeed - 1, 50));
        }
      }
    }

    if (!blueFood && currentScore >= 15) {

      if (Math.random() < 0.001) {
        setBlueFood(randomFoodPosition());
      }
    }

    if (currentScore >= 4) {
      if (Math.random() < 0.005) {
        setGreyFood((prevRocks) => [...prevRocks, randomFoodPosition()]);
      }
    }

    setSnake(tmpSnake);
  };

  return (
      <div
          className="App"
          onKeyDown={(e) => {
            const newKey = e.key;

            if (newKey === "w" && lastDirection === "s") return;
            if (newKey === "s" && lastDirection === "w") return;
            if (newKey === "a" && lastDirection === "d") return;
            if (newKey === "d" && lastDirection === "a") return;

            if (newKey === "W" && lastDirection === "S") return;
            if (newKey === "S" && lastDirection === "W") return;
            if (newKey === "A" && lastDirection === "D") return;
            if (newKey === "D" && lastDirection === "A") return;

            setLastDirection(newKey)
          }}
          ref={playgroundRef}
          tabIndex={0}
      >
        {isStarted && (
            <div className="count">
              Score: {snake.length - 3} | High Score: {highScore}
        </div>
        )}

        {!isStarted && !gameOver && (
            <>
              <button
                  onClick={() => {
                    setIsStarted(true);
                    playgroundRef.current.focus();
                  }}
                  type="submit"
              >
                Start
              </button>
              <div className="arrow-msg text">Press Arrows keys to play!</div>
            </>
        )}
        {gameOver && (
            <>
              <div className="game-over text" style={{color: "#ffffff"}}>Game Over!</div>
              <button
                  onClick={() => {
                    setIsStarted(true);
                    setGameOver(false);
                    setSnake(initialSnake.snake);
                    setLastDirection(initialSnake.direction);
                    setSpeed(initialSnake.speed);
                    setBlueFood(null);
                    setGreyFood([]);
                    playgroundRef.current.focus();
                  }}
                  type="submit"
              >
                Restart
              </button>
            </>
        )}
        <Snake snake={snake} lastDirection={lastDirection}/>
        {!gameOver && (
            <>
              {/* 💡 TEACHING MOMENT: Loop through the array to display multiple fruits on screen simultaneously */}
              {foodArray.map((foodPos, index) => (
                  <Food key={index} position={foodPos}/>
              ))}

              {blueFood && <Food position={blueFood} color= "cyan" />}

              {greyFood.map((rockPos, index) => (
                  <Food key = {index} position={rockPos} color={"gray"} />
              ))}
            </>
        )}
      </div>
  );
}


export default App;
