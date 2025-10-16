"""
AI Analyst - Uses Google Gemini API for regulatory change analysis
"""

import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
import google.generativeai as genai
from src.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

class AIAnalyst:
    """AI-powered analysis of regulatory changes using Google Gemini API"""
    
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model_name = "gemini-2.0-flash"
        
        if self.api_key and self.api_key != "your-gemini-api-key-here":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(self.model_name)
            logger.info("Google Gemini API configured successfully")
        else:
            logger.warning("Google Gemini API key not configured. Using mock analysis.")
            self.model = None
    
    async def analyze_changes(
        self,
        filtered_data: List[Dict[str, Any]],
        company_profile: Any,
        analysis_type: str = "comprehensive"
    ) -> List[Dict[str, Any]]:
        """Analyze regulatory changes using AI"""
        logger.info(f"Starting AI analysis for {len(filtered_data)} documents")
        
        if not self.model:
            return await self._mock_analysis(filtered_data, company_profile, analysis_type)
        
        regulatory_changes = []
        
        try:
            for i, document in enumerate(filtered_data[:10]):  # Limit to 10 for API efficiency
                change = await self._analyze_single_document(document, company_profile, analysis_type)
                if change:
                    regulatory_changes.append(change)
                    
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            # Fallback to mock analysis
            return await self._mock_analysis(filtered_data, company_profile, analysis_type)
        
        logger.info(f"AI analysis completed. Found {len(regulatory_changes)} regulatory changes")
        return regulatory_changes
    
    async def _analyze_single_document(
        self,
        document: Dict[str, Any], 
        company_profile: Any,
        analysis_type: str
    ) -> Optional[Dict[str, Any]]:
        """Analyze a single document using Gemini API"""
        try:
            # Prepare the prompt
            prompt = self._create_analysis_prompt(document, company_profile, analysis_type)
            
            # Generate analysis
            response = await self._generate_analysis(prompt)
            
            # Parse the response
            change = self._parse_ai_response(response, document)
            return change
            
        except Exception as e:
            logger.error(f"Failed to analyze document {document.get('title', 'Unknown')}: {e}")
            return None
    
    def _create_analysis_prompt(
        self, 
        document: Dict[str, Any], 
        company_profile: Any,
        analysis_type: str
    ) -> str:
        """Create a prompt for AI analysis"""
        company_context = f"""
        Company: {getattr(company_profile, 'company_name', 'Unknown')}
        Industry: {getattr(company_profile, 'industry', 'Unknown')}
        Jurisdiction: {getattr(company_profile, 'jurisdiction', 'Unknown')}
        Company Size: {getattr(company_profile, 'company_size', 'Unknown')}
        """
        
        document_content = f"""
        Document Title: {document.get('title', 'Unknown')}
        Document Content: {document.get('content', '')[:2000]}...
        Source URL: {document.get('url', '')}
        """
        
        prompt = f"""
        You are a regulatory compliance expert analyzing regulatory documents for a company.
        
        {company_context}
        
        {document_content}
        
        Please analyze this regulatory document and provide:
        1. A clear title for the regulatory change
        2. A detailed description of the change and its implications
        3. Impact level (low, medium, high, critical)
        4. Risk score (0.0 to 1.0)
        5. Specific compliance requirements (list of actionable items)
        6. Estimated deadline for compliance
        7. AI confidence score (0.0 to 1.0)
        
        Respond in JSON format:
        {{
            "title": "string",
            "description": "string",
            "impact_level": "low|medium|high|critical",
            "risk_score": 0.0-1.0,
            "compliance_requirements": ["requirement1", "requirement2"],
            "deadline": "YYYY-MM-DD",
            "ai_confidence": 0.0-1.0
        }}
        """
        
        return prompt
    
    async def _generate_analysis(self, prompt: str) -> str:
        """Generate analysis using Gemini API"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            raise e
    
    def _parse_ai_response(self, response: str, document: Dict[str, Any]) -> Dict[str, Any]:
        """Parse AI response into structured data"""
        try:
            # Extract JSON from response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start == -1 or json_end == 0:
                raise ValueError("No JSON found in response")
            
            json_str = response[json_start:json_end]
            ai_data = json.loads(json_str)
            
            # Create regulatory change object
            change = {
                "title": ai_data.get("title", "Regulatory Change"),
                "description": ai_data.get("description", ""),
                "impact_level": ai_data.get("impact_level", "medium"),
                "risk_score": float(ai_data.get("risk_score", 0.5)),
                "compliance_requirements": ai_data.get("compliance_requirements", []),
                "deadline": ai_data.get("deadline", "2024-12-31"),
                "source_url": document.get("url", ""),
                "source_title": document.get("title", ""),
                "analysis_date": datetime.utcnow().isoformat(),
                "ai_confidence": float(ai_data.get("ai_confidence", 0.8))
            }
            
            return change
            
        except Exception as e:
            logger.error(f"Failed to parse AI response: {e}")
            # Return a fallback change
            return {
                "title": f"Analysis of {document.get('title', 'Document')}",
                "description": "AI analysis failed, manual review required",
                "impact_level": "medium",
                "risk_score": 0.5,
                "compliance_requirements": ["Manual review required"],
                "deadline": "2024-12-31",
                "source_url": document.get("url", ""),
                "source_title": document.get("title", ""),
                "analysis_date": datetime.utcnow().isoformat(),
                "ai_confidence": 0.3
            }
    
    async def _mock_analysis(
        self, 
        filtered_data: List[Dict[str, Any]], 
        company_profile: Any,
        analysis_type: str
    ) -> List[Dict[str, Any]]:
        """Mock analysis when AI is not available"""
        logger.info("Using mock analysis (AI not configured)")
        
        regulatory_changes = []
        
        for i, document in enumerate(filtered_data[:5]):  # Limit to 5 for demo
            change = {
                "title": f"Regulatory Change {i+1}",
                "description": f"Analysis of {document.get('title', 'Unknown Document')}",
                "impact_level": "medium",
                "risk_score": 0.7,
                "compliance_requirements": [
                    "Review current policies",
                    "Update documentation",
                    "Train staff on new requirements"
                ],
                "deadline": "2024-06-01",
                "source_url": document.get("url", ""),
                "source_title": document.get("title", ""),
                "analysis_date": datetime.utcnow().isoformat(),
                "ai_confidence": 0.85
            }
            regulatory_changes.append(change)
        
        return regulatory_changes