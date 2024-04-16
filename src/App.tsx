import './index.css';
import { create } from 'zustand';
import { clsx } from 'clsx';
import { useEffect } from 'react';

type Coordinate = {
  stock: number;
  setBy: string;
};

type GridState = {
  [coordinate: string]: Coordinate;
};

type State = {
  turn: string;
  rows: number;
  cols: number;
  winner:string;
  gridState: GridState;
  initializeGridState: (rows: number, cols: number) => void;
  updateCoordinate: (row: number, col: number, setBy: string) => void;
  updateTurn: () => void;
  recursiveUpdate:(row:number,col:number,setBy:string)=>void;
  checkWinner:()=>void;
};

const initialState: State = {
  turn: 'A',
  rows: 10,
  cols: 6,
  winner:'N',
  gridState: {},
  initializeGridState: () => {},
  updateCoordinate: () => {},
  updateTurn: () => {},
  recursiveUpdate:()=>{},
  checkWinner :()=>{}
};

const useStore = create<State>((set) => ({
  ...initialState,
  initializeGridState: (rows, cols) => {
    const gridState: GridState = {};
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const coordinate = `${i}-${j}`;
        gridState[coordinate] = {
          stock: 0,
          setBy: 'N',
        };
      }
    }
    set({ turn: initialState.turn, rows, cols, gridState });
  },

  updateCoordinate: (row, col, turn) => {
    let setBy=turn;
    set((state) => {
      const coordinate = `${row}-${col}`;
      let updatedStock = state.gridState[coordinate].stock + 1;
      const newState = {
        ...state,
        gridState: {
          ...state.gridState,
          [coordinate]: {
            stock: (updatedStock === 4)?0:updatedStock,
            setBy:(updatedStock === 4)?'N':turn,
          },
        },
      };
      if(updatedStock === 4){
        newState.recursiveUpdate(row, col, setBy);
      }
      return newState;
    });
  },

  updateTurn: () => {
    set((state) => {
      console.log(state.gridState)
      const newTurn = state.turn === 'A' ? 'B' : 'A';
      return { ...state, turn: newTurn };
    });
  },

  checkWinner: () => {
    set((state) => {
      let Acount = 0;
      let Bcount = 0;
      
      for (const key in state.gridState) {
        if (state.gridState[key].setBy === 'A') {
          Acount++;
        } else if (state.gridState[key].setBy === 'B') {
          Bcount++;
        }
      }

      if(Acount>0 && Bcount==0 || Acount==0 && Bcount>0){
         if(Acount>1){
            state.winner='A'
         }else if(Bcount>1){
            state.winner='B'
         }
      }
  
      return state;
    });
  },
  
  

  recursiveUpdate: (x, y, setBy) => {
    set((state) => {
      const queue: { x: number; y: number }[] = [];
  
      state.gridState[`${x}-${y}`].stock = 0;
      state.gridState[`${x}-${y}`].setBy = 'N';
      queue.push({ x, y });
  
      while (queue.length > 0) {
        const { x, y } = queue.shift()!;
        state.gridState[`${x}-${y}`].stock = 0;
        state.gridState[`${x}-${y}`].setBy = 'N';

        if (state.gridState[`${x + 1}-${y}`]?.stock < 4) {
          state.gridState[`${x + 1}-${y}`].stock += 1;
          state.gridState[`${x + 1}-${y}`].setBy = setBy;
          if (state.gridState[`${x + 1}-${y}`].stock >= 4) {
            queue.push({ x: x + 1, y });
          }
        }
        if (state.gridState[`${x - 1}-${y}`]?.stock < 4) {
          state.gridState[`${x - 1}-${y}`].stock += 1;
          state.gridState[`${x - 1}-${y}`].setBy = setBy;
          if (state.gridState[`${x - 1}-${y}`].stock >= 4) {
            queue.push({ x: x - 1, y });
          }
        }
        if (state.gridState[`${x}-${y + 1}`]?.stock < 4) {
          state.gridState[`${x}-${y + 1}`].stock += 1;
          state.gridState[`${x}-${y + 1}`].setBy = setBy;
          if (state.gridState[`${x}-${y + 1}`].stock >= 4) {
            queue.push({ x, y: y + 1 });
          }
        }
        if (state.gridState[`${x}-${y - 1}`]?.stock < 4) {
          state.gridState[`${x}-${y - 1}`].stock += 1;
          state.gridState[`${x}-${y - 1}`].setBy = setBy;
          if (state.gridState[`${x}-${y - 1}`].stock >= 4) {
            queue.push({ x, y: y - 1 });
          }
        }
      }
  
      return state;
    });
  },

}));

const Cell = ({ x, y }: { x: number; y: number }) => {
  const { updateTurn, gridState , updateCoordinate , turn , checkWinner } = useStore();
  const coordinate = `${x}-${y}`;
 
  const stock = gridState[coordinate]?.stock;
  const setBy = gridState[coordinate]?.setBy;

  const handleClick = () => {
    if(setBy!==turn && setBy!='N') return;
    updateTurn();
    updateCoordinate(x,y,turn);
    checkWinner();
  };

  return (
    <div
      className={clsx('aspect-square border-2 border-slate-400 flex flex-col justify-center items-center rounded-md', {
        "bg-red-200":stock==1 && setBy=='A', 
        "bg-red-300":stock==2 && setBy=='A',
        "bg-red-400":stock==3 && setBy=='A',
        "bg-blue-200":stock==1 && setBy=='B', 
        "bg-blue-300":stock==2 && setBy=='B',
        "bg-blue-400":stock==3 && setBy=='B',
      })}
      key={`${x}-${y}`}
      onClick={() => handleClick()}
    >
    
    </div>
  );
};


const GenerateGrid = ({ row, column }: { row: number; column: number }) => {
  const grid = [];
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      grid.push(<Cell key={`${i}-${j}`} x={i} y={j} />);
    }
  }
  return (
    <div
      className={clsx(`grid gap-1 mx-auto`, {
        'grid-cols-4': column === 4,
        'grid-cols-6': column === 6,
        'grid-cols-8': column === 8,
        'grid-cols-10': column === 10,
      })}
    >
      {grid}
    </div>
  );
};

function App() {
  const { turn, initializeGridState, rows, cols , winner} = useStore();
  useEffect(() => {
    initializeGridState(rows, cols);
  }, []);

  return (
    <>
      <div className=' h-screen max-h-screen max-w-full w-full flex  flex-col justify-center items-center'>
      <div className='text-center mt-8'>Turn {turn}</div>
      <div className='text-center mb-2'>Winner {winner}</div>
        <div className='w-full px-6'>
          <GenerateGrid row={rows} column={cols} />
        </div>
      </div>
    </>
  );
}

export default App;
