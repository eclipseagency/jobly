/**
 * Vercel Domain Management
 *
 * This module handles adding/removing custom domains to Vercel projects.
 *
 * Required environment variables:
 * - VERCEL_API_TOKEN: Your Vercel API token (from vercel.com/account/tokens)
 * - VERCEL_PROJECT_ID: Your Vercel project ID (from project settings)
 * - VERCEL_TEAM_ID: (Optional) Your Vercel team ID if using a team
 */

const VERCEL_API_URL = 'https://api.vercel.com';

interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  verified: boolean;
  verification?: {
    type: string;
    domain: string;
    value: string;
    reason: string;
  }[];
  error?: {
    code: string;
    message: string;
  };
}

interface AddDomainResult {
  success: boolean;
  domain?: string;
  verified?: boolean;
  verificationRecords?: {
    type: string;
    name: string;
    value: string;
  }[];
  error?: string;
}

/**
 * Add a custom domain to the Vercel project
 */
export async function addDomainToVercel(domain: string): Promise<AddDomainResult> {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    console.warn('Vercel API credentials not configured. Domain will be saved but not added to Vercel.');
    return {
      success: true,
      domain,
      verified: false,
      error: 'Vercel API not configured - domain saved locally only',
    };
  }

  try {
    // Clean the domain (remove protocol, trailing slashes, etc.)
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .trim();

    if (!cleanDomain) {
      return { success: false, error: 'Invalid domain' };
    }

    // Build the API URL with optional team ID
    let apiUrl = `${VERCEL_API_URL}/v10/projects/${projectId}/domains`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: cleanDomain }),
    });

    const data: VercelDomainResponse = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (data.error?.code === 'domain_already_in_use') {
        return {
          success: false,
          error: 'This domain is already in use by another project',
        };
      }
      if (data.error?.code === 'domain_taken') {
        return {
          success: false,
          error: 'This domain is already claimed by another Vercel account',
        };
      }
      return {
        success: false,
        error: data.error?.message || 'Failed to add domain to Vercel',
      };
    }

    // Domain added successfully
    const result: AddDomainResult = {
      success: true,
      domain: data.name,
      verified: data.verified,
    };

    // If not verified, include verification records
    if (!data.verified && data.verification) {
      result.verificationRecords = data.verification.map(v => ({
        type: v.type,
        name: v.domain,
        value: v.value,
      }));
    }

    return result;
  } catch (error) {
    console.error('Error adding domain to Vercel:', error);
    return {
      success: false,
      error: 'Failed to connect to Vercel API',
    };
  }
}

/**
 * Remove a custom domain from the Vercel project
 */
export async function removeDomainFromVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return { success: true }; // No Vercel config, nothing to remove
  }

  try {
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .trim();

    let apiUrl = `${VERCEL_API_URL}/v9/projects/${projectId}/domains/${cleanDomain}`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const data = await response.json();
      return {
        success: false,
        error: data.error?.message || 'Failed to remove domain from Vercel',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing domain from Vercel:', error);
    return {
      success: false,
      error: 'Failed to connect to Vercel API',
    };
  }
}

/**
 * Check if a domain is verified in Vercel
 */
export async function checkDomainVerification(domain: string): Promise<{
  verified: boolean;
  configured: boolean;
  error?: string;
}> {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;

  if (!token || !projectId) {
    return { verified: false, configured: false, error: 'Vercel API not configured' };
  }

  try {
    const cleanDomain = domain
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .trim();

    let apiUrl = `${VERCEL_API_URL}/v9/projects/${projectId}/domains/${cleanDomain}`;
    if (teamId) {
      apiUrl += `?teamId=${teamId}`;
    }

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return { verified: false, configured: false };
    }

    if (!response.ok) {
      return { verified: false, configured: false, error: 'Failed to check domain status' };
    }

    const data: VercelDomainResponse = await response.json();

    return {
      verified: data.verified,
      configured: true,
    };
  } catch (error) {
    console.error('Error checking domain verification:', error);
    return {
      verified: false,
      configured: false,
      error: 'Failed to connect to Vercel API',
    };
  }
}
