"""
Content Filter - Stage 3 of the AI analysis pipeline
Filters and ranks acquired content based on relevance and quality
"""

from typing import List, Dict, Any
import re
from datetime import datetime, timedelta

class ContentFilter:
    """Filters and ranks regulatory content based on relevance and quality"""
    
    def __init__(self):
        self.quality_indicators = [
            "regulation", "compliance", "requirement", "mandate",
            "enforcement", "penalty", "deadline", "effective date"
        ]
        
        self.relevance_keywords = [
            "new", "updated", "amended", "revised", "changed",
            "announced", "published", "effective", "implementation"
        ]
    
    async def filter_content(
        self,
        raw_data: List[Dict[str, Any]],
        company_profile: Any,
        analysis_type: str = "comprehensive"
    ) -> List[Dict[str, Any]]:
        """Filter and rank content based on relevance and quality"""
        
        filtered_data = []
        
        for item in raw_data:
            # Calculate relevance score
            relevance_score = self._calculate_relevance_score(item, company_profile)
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(item)
            
            # Calculate recency score
            recency_score = self._calculate_recency_score(item)
            
            # Combined score
            combined_score = (relevance_score * 0.5) + (quality_score * 0.3) + (recency_score * 0.2)
            
            # Filter based on minimum score threshold
            if combined_score >= 0.3:  # Minimum threshold
                item["filtering_metadata"] = {
                    "relevance_score": relevance_score,
                    "quality_score": quality_score,
                    "recency_score": recency_score,
                    "combined_score": combined_score,
                    "filtered_at": datetime.utcnow().isoformat()
                }
                filtered_data.append(item)
        
        # Sort by combined score (highest first)
        filtered_data.sort(key=lambda x: x["filtering_metadata"]["combined_score"], reverse=True)
        
        # Limit results based on analysis type
        if analysis_type == "comprehensive":
            max_results = 50
        elif analysis_type == "targeted":
            max_results = 20
        else:  # monitoring
            max_results = 10
        
        return filtered_data[:max_results]
    
    def _calculate_relevance_score(self, item: Dict[str, Any], company_profile: Any) -> float:
        """Calculate relevance score based on company profile"""
        score = 0.0
        content = (item.get("title", "") + " " + item.get("content", "")).lower()
        
        # Industry relevance
        if company_profile.industry:
            industry_keywords = company_profile.industry.lower().split()
            for keyword in industry_keywords:
                if keyword in content:
                    score += 0.2
        
        # Jurisdiction relevance
        if company_profile.jurisdiction:
            jurisdiction_keywords = company_profile.jurisdiction.lower().split()
            for keyword in jurisdiction_keywords:
                if keyword in content:
                    score += 0.2
        
        # Company name relevance
        if company_profile.company_name:
            company_keywords = company_profile.company_name.lower().split()
            for keyword in company_keywords:
                if keyword in content:
                    score += 0.3
        
        # Custom keywords relevance
        if company_profile.keywords:
            for keyword in company_profile.keywords:
                if keyword.lower() in content:
                    score += 0.1
        
        # Relevance keywords
        for keyword in self.relevance_keywords:
            if keyword in content:
                score += 0.05
        
        return min(score, 1.0)
    
    def _calculate_quality_score(self, item: Dict[str, Any]) -> float:
        """Calculate quality score based on content indicators"""
        score = 0.0
        content = (item.get("title", "") + " " + item.get("content", "")).lower()
        
        # Quality indicators
        for indicator in self.quality_indicators:
            if indicator in content:
                score += 0.1
        
        # Source reliability
        source = item.get("source", "").lower()
        if "government" in source or "regulatory" in source:
            score += 0.3
        elif "official" in source or "authority" in source:
            score += 0.2
        elif "consultant" in source or "expert" in source:
            score += 0.1
        
        # Content length (longer content often more detailed)
        content_length = len(item.get("content", ""))
        if content_length > 1000:
            score += 0.2
        elif content_length > 500:
            score += 0.1
        
        # URL reliability
        url = item.get("url", "").lower()
        if any(domain in url for domain in [".gov", ".edu", ".org"]):
            score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_recency_score(self, item: Dict[str, Any]) -> float:
        """Calculate recency score based on publication date"""
        try:
            published_date_str = item.get("published_date", "")
            if not published_date_str:
                return 0.5  # Default score if no date
            
            published_date = datetime.fromisoformat(published_date_str.replace("Z", "+00:00"))
            now = datetime.utcnow()
            
            # Calculate days since publication
            days_ago = (now - published_date).days
            
            # Score decreases with age
            if days_ago <= 7:
                return 1.0
            elif days_ago <= 30:
                return 0.8
            elif days_ago <= 90:
                return 0.6
            elif days_ago <= 365:
                return 0.4
            else:
                return 0.2
                
        except Exception:
            return 0.5  # Default score if date parsing fails
    
    def _extract_key_phrases(self, content: str) -> List[str]:
        """Extract key phrases from content"""
        # Simple key phrase extraction - in real implementation, would use NLP
        phrases = []
        
        # Look for regulatory terms
        regulatory_patterns = [
            r"regulation\s+\w+",
            r"compliance\s+\w+",
            r"requirement\s+\w+",
            r"mandate\s+\w+"
        ]
        
        for pattern in regulatory_patterns:
            matches = re.findall(pattern, content.lower())
            phrases.extend(matches)
        
        return list(set(phrases))
