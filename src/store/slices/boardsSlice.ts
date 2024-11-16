import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Board {
  id: string
  name: string
  description: string
  url: string
  privacy: 'public' | 'private' | 'team'
  pinCount: number
  followerCount: number
}

interface BoardsState {
  boards: Board[]
  selectedBoards: string[]
  loading: boolean
  error: string | null
}

const initialState: BoardsState = {
  boards: [],
  selectedBoards: [],
  loading: false,
  error: null,
}

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    setBoards: (state, action: PayloadAction<Board[]>) => {
      state.boards = action.payload
      state.loading = false
      state.error = null
    },
    toggleBoardSelection: (state, action: PayloadAction<string>) => {
      const boardId = action.payload
      const index = state.selectedBoards.indexOf(boardId)
      if (index === -1) {
        state.selectedBoards.push(boardId)
      } else {
        state.selectedBoards.splice(index, 1)
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
  },
})

export const { setBoards, toggleBoardSelection, setLoading, setError } =
  boardsSlice.actions
export default boardsSlice.reducer
