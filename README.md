# Inventory Optimizer Lite

An advanced inventory optimization tool built with Next.js that replicates Excel-based inventory management models with demand forecasting, safety stock calculations, and comprehensive analytics.

## Features

- **Configuration Management**: Flexible model parameters for units, time periods, and calculation approaches
- **Excel Data Upload**: Support for importing inventory data, demand patterns, and historic inventory levels
- **Advanced Calculations**: 
  - Economic Order Quantity (EOQ) calculations
  - Safety stock optimization using statistical models
  - Cycle stock and in-transit inventory management
  - Service level optimization
- **Analytics Dashboard**: Real-time calculations with interactive charts and visualizations
- **Warehouse Analysis**: Pivot tables and summaries by warehouse location
- **Executive Summary**: Comprehensive reports with savings potential and recommendations

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Excel Processing**: XLSX library
- **Analytics**: Custom calculation engine with safety factor tables

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd inv-optimizer-lite
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Usage

### 1. Configuration Setup
- Navigate to `/config` to set up model parameters
- Configure volume units, currency, time units, and forecasting periods
- Select reorder quantity approach (EOQ or Direct input)

### 2. Data Upload
- Go to `/upload` to import your Excel file
- Ensure your Excel file contains:
  - **Input sheet**: Basic inventory parameters
  - **Demand data**: Historical demand patterns (columns AG-PP)
  - **Historic inventory**: Past inventory levels (columns PR-AFA)

### 3. Analytics Dashboard
- View `/analytics` for detailed calculations and visualizations
- Interactive charts showing warehouse comparisons
- Top savings opportunities identification
- Service level and inventory turnover metrics

### 4. Executive Summary
- Access `/summary` for high-level insights
- Key performance indicators and recommendations
- Exportable reports for stakeholders
- Warehouse performance breakdown

## Excel File Format

Your input Excel file should contain:

- **Config Sheet**: Model configuration parameters
- **Input Sheet**: 
  - Basic item information (ID, description, warehouse, etc.)
  - Demand data in columns AG through PP (13 periods)
  - Historic inventory data in columns PR through AFA
- **Safety Factor Table**: Statistical lookup tables (hidden from users)

## Calculation Engine

The application replicates complex Excel formulas including:

- **EOQ Calculation**: `√((2 × Annual Demand × Order Cost) / (Unit Cost × Holding Rate))`
- **Safety Stock**: Uses statistical models with normal distribution functions
- **Reorder Point**: Average lead time demand + Safety stock
- **Service Level Optimization**: Configurable target service levels
- **Savings Calculation**: Current inventory value vs. optimized target

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Docker

```bash
# Build Docker image
docker build -t inv-optimizer-lite .

# Run container
docker run -p 3000:3000 inv-optimizer-lite
```

### Traditional Hosting

```bash
npm run build
npm start
```

## API Endpoints

- `GET/POST /api/config` - Configuration management
- `GET/POST /api/upload` - File upload and data processing
- `GET/POST /api/analytics` - Calculation results and analytics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.