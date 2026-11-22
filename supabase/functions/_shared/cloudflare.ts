const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
const CLOUDFLARE_ZONE_ID = Deno.env.get('CLOUDFLARE_ZONE_ID');
const DOMAIN = 'hostminecraft.com';

export interface DNSRecord {
  type: 'A' | 'CNAME';
  name: string;
  content: string;
  ttl?: number;
}

export function isValidIP(ip: string): boolean {
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
}

export function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

export async function createDNSRecord(subdomain: string, target: string) {
  try {
    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      console.error('❌ Cloudflare configuration missing');
      return { success: false, error: 'Cloudflare configuration missing' };
    }

    const recordType = isValidIP(target) ? 'A' : 'CNAME';
    const recordName = `${subdomain}.${DOMAIN}`;

    // Validate target based on record type
    if (recordType === 'A' && !isValidIP(target)) {
      return { success: false, error: 'Invalid IP address format' };
    }
    if (recordType === 'CNAME' && !isValidDomain(target)) {
      return { success: false, error: 'Invalid domain name format' };
    }

    const dnsRecord: DNSRecord = {
      type: recordType,
      name: recordName,
      content: target,
      ttl: 300, // 5 minutes
    };

    console.log(`🌐 Creating ${recordType} record for ${recordName} -> ${target}`);

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dnsRecord),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Cloudflare API error:', data);
      return { 
        success: false, 
        error: data.errors?.[0]?.message || 'Failed to create DNS record' 
      };
    }

    console.log(`✅ Successfully created ${recordType} record with ID: ${data.result.id}`);

    return {
      success: true,
      record_id: data.result.id,
      record_type: recordType,
      message: `${recordType} record created successfully`,
    };
  } catch (error: any) {
    console.error('❌ Error creating DNS record:', error);
    return { success: false, error: error.message };
  }
}

export async function updateDNSRecord(recordId: string, subdomain: string, target: string) {
  try {
    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      return { success: false, error: 'Cloudflare configuration missing' };
    }

    const recordType = isValidIP(target) ? 'A' : 'CNAME';
    const recordName = `${subdomain}.${DOMAIN}`;

    // Validate target based on record type
    if (recordType === 'A' && !isValidIP(target)) {
      return { success: false, error: 'Invalid IP address format' };
    }
    if (recordType === 'CNAME' && !isValidDomain(target)) {
      return { success: false, error: 'Invalid domain name format' };
    }

    const dnsRecord: DNSRecord = {
      type: recordType,
      name: recordName,
      content: target,
      ttl: 300,
    };

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dnsRecord),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Cloudflare API error:', data);
      return { 
        success: false, 
        error: data.errors?.[0]?.message || 'Failed to update DNS record' 
      };
    }

    return {
      success: true,
      record_type: recordType,
      message: `${recordType} record updated successfully`,
    };
  } catch (error: any) {
    console.error('❌ Error updating DNS record:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDNSRecord(recordId: string) {
  try {
    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      return { success: false, error: 'Cloudflare configuration missing' };
    }

    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${recordId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Cloudflare API error:', data);
      return { 
        success: false, 
        error: data.errors?.[0]?.message || 'Failed to delete DNS record' 
      };
    }

    return {
      success: true,
      message: 'DNS record deleted successfully',
    };
  } catch (error: any) {
    console.error('❌ Error deleting DNS record:', error);
    return { success: false, error: error.message };
  }
}