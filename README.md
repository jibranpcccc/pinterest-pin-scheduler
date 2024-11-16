# Pinterest Pin Scheduler

A comprehensive web application for efficiently scheduling and managing multiple Pinterest pins with advanced optimization features.

## Project Structure
```
src/
├── components/       # Reusable UI components
├── layouts/         # Layout components
├── pages/           # Page components
├── store/          # Redux store and slices
│   └── slices/     # Redux slices
├── hooks/          # Custom React hooks
└── utils/          # Utility functions
```

## Tech Stack
- React 18
- TypeScript
- Redux Toolkit
- Tailwind CSS
- React Router v6
- Vite

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
VITE_PINTEREST_CLIENT_ID=your_client_id
VITE_PINTEREST_CLIENT_SECRET=your_client_secret
VITE_MAX_PINS_PER_DAY=100
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true
```

## Features
- Dashboard with quick actions and performance stats
- Pin creation wizard with image upload
- Queue management system
- Scheduling calendar
- Analytics dashboard
- Settings management

## Development Progress
- [x] Project setup with Vite and TypeScript
- [x] Redux store configuration
- [x] Basic routing setup
- [x] Layout components
- [x] Dashboard page
- [x] Analytics page
- [ ] Complete Pinterest OAuth integration
- [ ] Implement real-time scheduling
- [ ] Add comprehensive error handling
- [ ] Add unit and integration tests

## Contributing
1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License
MIT
