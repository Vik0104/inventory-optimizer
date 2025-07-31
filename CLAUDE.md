# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev

# Build for production  
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture Overview

This is an **Inventory Optimizer Lite** application built with Next.js 15 that replicates complex Excel-based inventory management models. The application processes Excel files containing demand forecasting data and performs advanced inventory optimization calculations.

### Core Structure

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript, Tailwind CSS
- **Charts**: Recharts for analytics visualizations  
- **Excel Processing**: XLSX library for parsing inventory data files
- **Calculation Engine**: Custom TypeScript classes replicating Excel formulas

### Key Pages and API Routes

- `/config` - Model parameter configuration (units, currency, forecasting periods)
- `/upload` - Excel file upload and data processing
- `/analytics` - Interactive dashboard with calculations and charts
- `/summary` - Executive summary with savings potential and recommendations

API endpoints mirror the pages: `/api/config`, `/api/upload`, `/api/analytics`

### Excel Data Processing

The application expects specific Excel file structure:
- **Input sheet**: Main inventory data with demand data in columns AG-PP (13 periods) and historic inventory in columns PR-AFA
- **Config sheet**: Model configuration parameters
- **Safety Factor Table**: Statistical lookup tables (hidden from users)

### Calculation Engine Architecture

The heart of the application is `src/utils/calculationEngine.ts` which contains:

- **InventoryCalculator class**: Main calculation orchestrator
- **Economic Order Quantity (EOQ)**: `√((2 × Annual Demand × Order Cost) / (Unit Cost × Holding Rate))`
- **Safety Stock Optimization**: Uses statistical models with normal distribution functions
- **Demand Statistics**: Mean, standard deviation, variability calculations from historical data
- **Service Level Optimization**: Configurable target service levels with reorder point calculations

### Safety Factor Table System

`src/utils/safetyFactorTable.ts` implements a sophisticated statistical lookup system:
- Pre-calculated E(k) - E(k+q/σ) values for safety stock optimization
- Normal distribution PDF/CDF functions with Abramowitz-Stegun approximation
- Cached table generation for performance (k values 5.0 to 0, q/σ values 3.0 to 0)
- Bisection method for finding optimal k-factors based on service levels

### Data Types

Core interfaces in `src/types/index.ts`:
- **Config**: Model configuration (units, currency, forecasting approach)
- **InputRow**: Individual inventory item with demand data, costs, lead times
- **CalculationResult**: Computed values (cycle stock, safety stock, savings potential)
- **SafetyFactorEntry**: Statistical lookup table entries

### Excel Parser Logic

`src/utils/excelParser.ts` handles:
- Finding "Input" sheet in uploaded Excel files
- Extracting demand data from specific column ranges (AG-PP = columns 32-44)
- Parsing historic inventory data from columns PR-AFA (columns 46-831)
- Data validation and error handling for missing or malformed data

## Development Notes

- The application replicates complex Excel inventory models, so calculations must maintain high precision
- Safety factor calculations use pre-computed lookup tables for performance
- Excel column mappings are hardcoded based on expected template structure
- Default values are provided for missing inventory parameters (unitCost: 10, leadTime: 30, serviceLevel: 0.95)
- The calculation engine supports both EOQ and direct input approaches for reorder quantities