type LoginParams = {
    username: string;
    password: string;
    moduleToExport: string;
    userNameCriteria?: string;
    passwordCriteria?: string;
}


const callAdonixSoapServiceWithAuth = async (params: LoginParams) => {
    // First, let's create the authentication header
    // Think of this as preparing your ID card for the security checkpoint
    const credentials = `${params.username}:${params.password}`;
    
    // Base64 encoding is like putting your credentials in a standard envelope format
    // React Native has built-in support for this through the global btoa function
    const encodedCredentials = btoa(credentials);
    
    // The Authorization header follows a specific format: "Basic " + encoded credentials
    const authHeader = `Basic ${encodedCredentials}`;
    
    // Now let's build your JSON payload just like before
    // This is the actual business data you want to send
    const jsonPayload = {
      "GRP1": {
        "I_MODEXP": params.moduleToExport,
        "I_CHRONO": "NO"
      },
      "GRP2": [
        {"I_TCRITERE": `ZUSER=${params.userNameCriteria}`},
        {"I_TCRITERE": `ZPWD=${params.passwordCriteria}`}  
      ],
      "GRP3": {
        "I_EXEC": "REALTIME",
        "I_RECORDSEP": "|"
      }
    };
  
    // Build the SOAP envelope exactly as before
    // The authentication doesn't change the SOAP structure - it just adds security to the transport
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
      <soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                        xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                        xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                        xmlns:wss="http://www.adonix.com/WSS">
        <soapenv:Header/>
        <soapenv:Body>
          <wss:run soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <callContext xsi:type="wss:CAdxCallContext">
              <codeLang xsi:type="xsd:string">FRA</codeLang>
              <poolAlias xsi:type="xsd:string">ZBPI</poolAlias>
              <poolId xsi:type="xsd:string"/>
              <requestConfig xsi:type="xsd:string">adxwss.beautify=true&adxwss.optreturn=JSON</requestConfig>
            </callContext>
            <publicName xsi:type="xsd:string">AOWSEXPORT</publicName>
            <inputXml xsi:type="xsd:string">${JSON.stringify(jsonPayload)}</inputXml>
          </wss:run>
        </soapenv:Body>
      </soapenv:Envelope>`;
  
    try {
      // Here's where we add the authentication header alongside the other headers
      // Think of this as showing your ID card while also presenting your business documents
      const response = await fetch('YOUR_ADONIX_ENDPOINT_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'run',
          'Authorization': authHeader,  // This is your security badge
        },
        body: soapEnvelope,
      });
  
      // Always check if the authentication was successful
      // A 401 status code means "Unauthorized" - like being turned away at the security checkpoint
      if (response.status === 401) {
        throw new Error('Authentication failed - please check your username and password');
      }
      
      // A 403 status code means "Forbidden" - you're authenticated but don't have permission
      if (response.status === 403) {
        throw new Error('Access denied - you don\'t have permission to access this resource');
      }
  
      const responseText = await response.text();
      console.log(responseText);
      return responseText;
    } catch (error) {
      console.error('Adonix SOAP Error:', error);
      throw error;
    }
  };