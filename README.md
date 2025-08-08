# Canva Slide Downloader

A high-quality Canva slide downloader that captures presentations at maximum resolution and exports them as PDF files.

## Features

- 🎯 **High-Resolution Screenshots**: Capture slides at 4K quality
- 📄 **PDF Export**: Convert screenshots to optimized PDF files
- 🔄 **Batch Processing**: Download multiple presentations at once
- 📱 **Mobile-First Design**: Responsive interface for all devices
- ⚡ **Fast Processing**: Optimized for speed and efficiency

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, shadcn/ui, Framer Motion
- **Screenshot**: Puppeteer
- **PDF Generation**: jsPDF, PDF-lib
- **State Management**: Zustand

## Project Structure

```
canva-slide-download/
├── docs/                   # Documentation
│   └── PRD.md             # Product Requirements Document
├── src/
│   ├── app/               # Next.js App Router
│   ├── components/        # React components
│   ├── lib/              # Utilities and configurations
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── tests/               # Test files
```

## Development

This project is part of the shared-tools architecture and follows the same patterns as other tools in the suite.

## Documentation

See [PRD.md](./docs/PRD.md) for detailed product requirements and technical specifications.

## License

MIT