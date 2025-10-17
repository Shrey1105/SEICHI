"""
AI Analyst - Stage 4 of the AI analysis pipeline
Uses AI to analyze filtered content and extract regulatory changes
"""

import logging
from typing import List, Dict, Any
import google.generativeai as genai
from ...database.models import CompanyProfile
from ...config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

class AIAnalyst:
    """Uses AI to analyze regulatory content and extract insights"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self._initialize_ai_client()
    
    def _initialize_ai_client(self):
        """Initialize the AI client"""
        try:
            if GEMINI_API_KEY:
                genai.configure(api_key=GEMINI_API_KEY)
                self.model = genai.GenerativeModel('gemini-pro')
                self.logger.info("AI client initialized successfully")
            else:
                self.logger.warning("AI API key not configured. Using mock analysis.")
                self.model = None
        except Exception as e:
            self.logger.error(f"Failed to initialize AI client: {e}")
            self.model = None
    
    async def analyze_changes(
        self,
        filtered_data: List[Dict[str, Any]],
        company_profile: CompanyProfile,
        analysis_type: str = "comprehensive"
    ) -> List[Dict[str, Any]]:
        """Analyze filtered content and extract regulatory changes"""
        
        self.logger.info(f"Analyzing {len(filtered_data)} filtered items")
        
        regulatory_changes = []
        
        # Process data in batches to avoid overwhelming the AI
        batch_size = 5
        for i in range(0, len(filtered_data), batch_size):
            batch = filtered_data[i:i + batch_size]
            batch_changes = await self._analyze_batch(batch, company_profile, analysis_type)
            regulatory_changes.extend(batch_changes)
        
        self.logger.info(f"Extracted {len(regulatory_changes)} regulatory changes")
        return regulatory_changes
    
    async def _analyze_batch(
        self,
        batch: List[Dict[str, Any]],
        company_profile: CompanyProfile,
        analysis_type: str
    ) -> List[Dict[str, Any]]:
        """Analyze a batch of content items"""
        
        if not self.model:
            # Use mock analysis if AI is not available
            return self._mock_analyze_batch(batch, company_profile)
        
        try:
            # Prepare content for analysis
            content_text = self._prepare_content_for_analysis(batch)
            
            # Create analysis prompt
            prompt = self._create_analysis_prompt(content_text, company_profile, analysis_type)
            
            # Generate analysis
            response = await self._generate_analysis(prompt)
            
            # Parse response into regulatory changes
            changes = self._parse_analysis_response(response, batch)
            
            return changes
            
        except Exception as e:
            self.logger.error(f"AI analysis failed: {e}")
            # Fallback to mock analysis
            return self._mock_analyze_batch(batch, company_profile)
    
    def _prepare_content_for_analysis(self, batch: List[Dict[str, Any]]) -> str:
        """Prepare content text for AI analysis"""
        
        content_parts = []
        
        for item in batch:
            content_parts.append(f"""
Source: {item.get('source', 'Unknown')}
Title: {item.get('title', 'No title')}
Content: {item.get('content', 'No content')}
URL: {item.get('url', 'No URL')}
---
""")
        
        return "\n".join(content_parts)
    
    def _create_analysis_prompt(
        self,
        content_text: str,
        company_profile: CompanyProfile,
        analysis_type: str
    ) -> str:
        """Create analysis prompt for AI"""
        
        prompt = f"""
You are a regulatory compliance analyst. Analyze the following regulatory content and extract key regulatory changes that would affect a company with the following profile:

Company: {company_profile.company_name}
Industry: {company_profile.industry or 'Not specified'}
Jurisdiction: {company_profile.jurisdiction or 'Not specified'}
Company Size: {company_profile.company_size or 'Not specified'}

Analysis Type: {analysis_type}

For each regulatory change found, provide:
1. Title of the regulation/change
2. Summary of the change
3. Impact assessment for the company
4. Compliance requirements
5. Implementation timeline
6. Risk level (low, medium, high, critical)
7. Confidence score (0.0 to 1.0)
8. Relevant regulatory sections
9. Affected business areas
10. Recommended action items

Content to analyze:
{content_text}

Please provide your analysis in a structured format, focusing on actionable insights for the company.
"""
        
        return prompt
    
    async def _generate_analysis(self, prompt: str) -> str:
        """Generate analysis using AI"""
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            self.logger.error(f"AI generation failed: {e}")
            raise
    
    def _parse_analysis_response(
        self,
        response: str,
        source_batch: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Parse AI response into structured regulatory changes"""
        
        changes = []
        
        # For now, create mock changes based on the source batch
        # In a real implementation, this would parse the AI response
        for item in source_batch:
            change = {
                "source_url": item.get("url", ""),
                "title": f"Regulatory Update: {item.get('title', 'Unknown')}",
                "summary": f"Analysis of regulatory content from {item.get('source', 'Unknown source')}",
                "impact_assessment": "This regulation may impact the company's operations and compliance requirements.",
                "compliance_requirements": "Review current practices and update compliance procedures as needed.",
                "implementation_timeline": "Immediate review recommended, implementation within 90 days.",
                "risk_level": "medium",
                "confidence_score": 0.7,
                "relevant_sections": ["Section 1", "Section 2"],
                "affected_areas": ["Operations", "Compliance"],
                "action_items": [
                    "Review current compliance procedures",
                    "Assess impact on operations",
                    "Update documentation as needed"
                ]
            }
            changes.append(change)
        
        return changes
    
    def _mock_analyze_batch(
        self,
        batch: List[Dict[str, Any]],
        company_profile: CompanyProfile
    ) -> List[Dict[str, Any]]:
        """Mock analysis for when AI is not available"""
        
        changes = []
        
        for item in batch:
            # Determine risk level based on source type
            source_type = item.get("source_type", "")
            if source_type == "government":
                risk_level = "high"
                confidence_score = 0.9
            elif source_type == "regulatory_body":
                risk_level = "high"
                confidence_score = 0.8
            elif source_type == "legal":
                risk_level = "medium"
                confidence_score = 0.7
            else:
                risk_level = "low"
                confidence_score = 0.6
            
            change = {
                "source_url": item.get("url", ""),
                "title": f"Regulatory Update: {item.get('title', 'Unknown')}",
                "summary": f"Regulatory change identified from {item.get('source', 'Unknown source')} that may affect {company_profile.company_name}.",
                "impact_assessment": f"This regulation may impact {company_profile.industry or 'the company'} operations and compliance requirements.",
                "compliance_requirements": "Review current practices and update compliance procedures as needed.",
                "implementation_timeline": "Immediate review recommended, implementation within 90 days.",
                "risk_level": risk_level,
                "confidence_score": confidence_score,
                "relevant_sections": ["Section 1", "Section 2"],
                "affected_areas": ["Operations", "Compliance"],
                "action_items": [
                    "Review current compliance procedures",
                    "Assess impact on operations",
                    "Update documentation as needed",
                    "Train staff on new requirements"
                ]
            }
            changes.append(change)
        
        return changes