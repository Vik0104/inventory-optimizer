import { NextRequest, NextResponse } from 'next/server';
import { Config } from '@/types';
import { globalStore } from '@/lib/globalStore';

export async function GET() {
  return NextResponse.json(globalStore.getConfig());
}

export async function POST(request: NextRequest) {
  try {
    const config: Config = await request.json();
    
    // Validate config
    if (!config.volumeUnits || !config.currency || !config.inputTimeUnit || 
        !config.forecastingPeriod || !config.reorderQuantityApproach) {
      return NextResponse.json(
        { error: 'Missing required configuration fields' },
        { status: 400 }
      );
    }

    // Validate reorderQuantityApproach
    if (!['EOQ', 'Direct input'].includes(config.reorderQuantityApproach)) {
      return NextResponse.json(
        { error: 'Invalid reorder quantity approach' },
        { status: 400 }
      );
    }

    globalStore.setConfig(config);
    return NextResponse.json(globalStore.getConfig());
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON payload' },
      { status: 400 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}