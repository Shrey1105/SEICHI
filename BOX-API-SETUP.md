# Box API Integration Setup Guide

This guide will help you set up Box API integration for the Regulatory Intelligence Platform.

## Prerequisites

1. **Box Developer Account**: You need a Box developer account to create an application
2. **Box Enterprise Account** (Recommended): For production use with enterprise features
3. **Admin Access**: To configure Box API credentials

## Step 1: Create a Box Application

1. **Log in to Box Developer Console**
   - Go to [https://developer.box.com/](https://developer.box.com/)
   - Sign in with your Box account

2. **Create New Application**
   - Click "Create New App"
   - Select "Custom App"
   - Choose "Server Authentication (JWT)" for server-to-server authentication
   - Enter application details:
     - **App Name**: `Regulatory Intelligence Platform`
     - **Description**: `Document management for regulatory compliance platform`

3. **Configure Application Settings**
   - **Authentication Method**: Server Authentication (JWT)
   - **Application Access**: Enterprise (if you have Box Enterprise)
   - **Application Scopes**: Select the following scopes:
     - `Read and write all files and folders`
     - `Manage users`
     - `Manage enterprise properties`

## Step 2: Generate JWT Key Pair

1. **Generate Key Pair**
   - In your Box application settings, go to "Configuration"
   - Scroll down to "Add and Manage Public Keys"
   - Click "Generate a Public/Private Keypair"
   - Download the private key file (JSON format)

2. **Extract Credentials**
   - Open the downloaded JSON file
   - Note the following values:
     - `clientID`
     - `clientSecret`
     - `publicKeyID`
     - `privateKey`
     - `passphrase`

## Step 3: Configure Box API in the Platform

1. **Update Environment Variables**
   ```bash
   # Copy the example environment file
   cp backend/regulatory_analyzer/env.example backend/regulatory_analyzer/.env
   ```

2. **Add Box API Credentials**
   ```env
   # Box API Configuration
   BOX_CLIENT_ID=your-client-id-from-json
   BOX_CLIENT_SECRET=your-client-secret-from-json
   BOX_ACCESS_TOKEN=your-access-token
   BOX_REFRESH_TOKEN=your-refresh-token
   BOX_ENTERPRISE_ID=your-enterprise-id
   BOX_FOLDER_ID=0
   ```

3. **Generate Access Token** (One-time setup)
   ```python
   # Create a script to generate access token
   import json
   from boxsdk import JWTAuth, Client

   # Load your Box app configuration
   with open('path/to/your/box-app-config.json', 'r') as f:
       config = json.load(f)

   # Create JWT auth object
   auth = JWTAuth(
       client_id=config['boxAppSettings']['clientID'],
       client_secret=config['boxAppSettings']['clientSecret'],
       enterprise_id=config['enterpriseID'],
       jwt_key_id=config['boxAppSettings']['appAuth']['publicKeyID'],
       rsa_private_key_data=config['boxAppSettings']['appAuth']['privateKey'],
       rsa_private_key_passphrase=config['boxAppSettings']['appAuth']['passphrase']
   )

   # Get access token
   access_token = auth.authenticate_instance()
   print(f"Access Token: {access_token}")
   ```

## Step 4: Test Box Integration

1. **Start the Application**
   ```bash
   docker-compose up -d
   ```

2. **Check Box Status**
   - Navigate to `http://localhost:3000/box-documents`
   - The page should show "Box Integration Active" if configured correctly

3. **Test File Upload**
   - Try uploading a test document
   - Verify it appears in your Box account

## Step 5: Configure Folder Structure

1. **Automatic Setup**
   - Go to the Box Documents page
   - Click "Setup Company Folders" for each company profile
   - This creates organized folder structures:
     ```
     Regulatory Documents - [Company Name]/
     ├── Compliance Reports/
     ├── Regulatory Changes/
     ├── Policy Documents/
     └── Audit Reports/
     ```

2. **Manual Setup**
   - Create folders manually through the web interface
   - Use the folder manager to organize documents

## Step 6: Security Configuration

1. **Access Controls**
   - Configure Box enterprise policies
   - Set up user access controls
   - Enable audit logging

2. **Data Retention**
   - Configure Box retention policies
   - Set up automated document lifecycle management

## Troubleshooting

### Common Issues

1. **"Box API is not available"**
   - Check environment variables are set correctly
   - Verify Box credentials are valid
   - Ensure network connectivity to Box API

2. **Authentication Errors**
   - Verify JWT key pair is correct
   - Check enterprise ID matches your Box account
   - Ensure application has proper scopes

3. **Upload Failures**
   - Check file size limits (default: 10MB)
   - Verify folder permissions
   - Check Box storage quota

### Debug Mode

Enable debug logging to troubleshoot issues:

```env
DEBUG=True
LOG_LEVEL=DEBUG
```

Check logs:
```bash
docker-compose logs backend
```

## Production Considerations

1. **Security**
   - Use Box Enterprise for production
   - Enable SSO integration
   - Configure data loss prevention (DLP)

2. **Performance**
   - Use Box CDN for file delivery
   - Implement caching strategies
   - Monitor API rate limits

3. **Compliance**
   - Enable Box Governance
   - Configure retention policies
   - Set up audit trails

## API Endpoints

The Box integration provides the following API endpoints:

- `GET /api/box/status` - Check Box API status
- `POST /api/box/folders` - Create new folder
- `GET /api/box/folders` - List folders
- `POST /api/box/upload` - Upload file
- `GET /api/box/documents` - List documents
- `GET /api/box/documents/{id}/download` - Download file
- `POST /api/box/documents/{id}/shared-link` - Create shared link
- `DELETE /api/box/documents/{id}` - Delete document
- `POST /api/box/company/{id}/setup-folders` - Setup company folders
- `GET /api/box/search` - Search documents

## Support

For Box API issues:
- [Box Developer Documentation](https://developer.box.com/)
- [Box API Reference](https://developer.box.com/reference)
- [Box Community Forum](https://community.box.com/)

For platform-specific issues:
- Check the application logs
- Review the troubleshooting section above
- Contact the development team
