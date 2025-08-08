// API fallback for static export
// These functions simulate API responses for the static version

export async function parseCanvaUrl(url: string) {
  // Basic URL validation for static version
  if (!url.includes('canva.com/design/')) {
    return {
      valid: false,
      error: 'Invalid Canva URL format'
    };
  }

  const designId = extractDesignId(url);
  if (!designId) {
    return {
      valid: false,
      error: 'Unable to extract design ID'
    };
  }

  // Return mock success for demo
  return {
    valid: true,
    title: `Canva Design ${designId.slice(0, 8)}`,
    slideCount: 1,
    url,
    designId,
    timestamp: new Date().toISOString()
  };
}

export async function downloadCanvaSlides(url: string, options: any) {
  // For static version, this will show a message about needing server deployment
  return {
    success: false,
    error: 'Download functionality requires server deployment. Please deploy to Vercel or similar platform for full functionality.'
  };
}

function extractDesignId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const designIndex = pathParts.indexOf('design');
    
    if (designIndex !== -1 && pathParts[designIndex + 1]) {
      return pathParts[designIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
}