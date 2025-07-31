import { NextRequest, NextResponse } from 'next/server';
import { parseExcelFile, validateInputData } from '@/utils/excelParser';
import { globalStore } from '@/lib/globalStore';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    try {
      // Parse Excel file
      const parsedData = await parseExcelFile(arrayBuffer);
      
      // Validate data
      const validation = validateInputData(parsedData);
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            error: 'Data validation failed',
            details: validation.errors
          },
          { status: 400 }
        );
      }
      
      // Store data in global store
      globalStore.setData(parsedData);
      console.log(`✅ Stored ${parsedData.length} items in global store`);
      
      return NextResponse.json({
        message: 'File uploaded and processed successfully',
        rowCount: parsedData.length,
        preview: parsedData.slice(0, 5) // Return first 5 rows as preview
      });
      
    } catch (parseError) {
      return NextResponse.json(
        { error: `Failed to parse Excel file: ${parseError}` },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const status = globalStore.getStatus();
  return NextResponse.json({
    hasData: status.hasData,
    rowCount: status.itemCount,
    data: status.hasData ? globalStore.getData() : []
  });
}