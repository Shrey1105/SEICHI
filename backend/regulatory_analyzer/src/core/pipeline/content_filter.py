"""
Content Filter - Stage 3 of the AI analysis pipeline
Filters and ranks acquired data based on relevance and quality
"""

import logging
from typing import List, Dict, Any
from ...database.models import CompanyProfile

logger = logging.getLogger(__name__)

class ContentFilter:
    """Filters and ranks regulatory content based on relevance and quality"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def filter_content(
        self,
        raw_data: List[Dict[str, Any]],
        company_profile: CompanyProfile,
        analysis_type: str = "comprehensive"
    ) -> List[Dict[str, Any]]:
        """Filter and rank content based on relevance and quality"""
        
        self.logger.info(f"Filtering {len(raw_data)} data items")
        
        # Apply quality filters
        quality_filtered = await self._apply_quality_filters(raw_data)
        
        # Apply relevance filters
        relevance_filtered = await self._apply_relevance_filters(quality_filtered, company_profile)
        
        # Rank content by importance
        ranked_content = await self._rank_content(relevance_filtered, company_profile, analysis_type)
        
        # Remove duplicates
        deduplicated = await self._remove_duplicates(ranked_content)
        
        self.logger.info(f"Filtered to {len(deduplicated)} relevant items")
        return deduplicated
    
    async def _apply_quality_filters(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Apply quality filters to remove low-quality content"""
        
        filtered_data = []
        
        for item in data:
            # Check if item has required fields
            if not all(key in item for key in ["title", "content", "source"]):
                continue
            
            # Check content length
            if len(item.get("content", "")) < 50:
                continue
            
            # Check relevance score
            relevance_score = item.get("relevance_score", 0)
            if relevance_score < 0.3:
                continue
            
            # Check source type quality
            source_type = item.get("source_type", "")
            if source_type in ["spam", "low_quality"]:
                continue
            
            filtered_data.append(item)
        
        return filtered_data
    
    async def _apply_relevance_filters(
        self,
        data: List[Dict[str, Any]],
        company_profile: CompanyProfile
    ) -> List[Dict[str, Any]]:
        """Apply relevance filters based on company profile"""
        
        filtered_data = []
        
        for item in data:
            relevance_score = self._calculate_relevance_score(item, company_profile)
            item["relevance_score"] = relevance_score
            
            # Only include items with sufficient relevance
            if relevance_score >= 0.5:
                filtered_data.append(item)
        
        return filtered_data
    
    def _calculate_relevance_score(
        self,
        item: Dict[str, Any],
        company_profile: CompanyProfile
    ) -> float:
        """Calculate relevance score for an item based on company profile"""
        
        score = 0.0
        
        # Base score from source
        base_score = item.get("relevance_score", 0.5)
        score += base_score * 0.3
        
        # Industry relevance
        if company_profile.industry:
            industry_keywords = self._get_industry_keywords(company_profile.industry)
            if any(keyword in item.get("content", "").lower() for keyword in industry_keywords):
                score += 0.2
        
        # Jurisdiction relevance
        if company_profile.jurisdiction:
            jurisdiction_keywords = self._get_jurisdiction_keywords(company_profile.jurisdiction)
            if any(keyword in item.get("content", "").lower() for keyword in jurisdiction_keywords):
                score += 0.2
        
        # Company keywords relevance
        if company_profile.keywords:
            for keyword in company_profile.keywords:
                if keyword.lower() in item.get("content", "").lower():
                    score += 0.1
        
        # Source type relevance
        source_type = item.get("source_type", "")
        source_scores = {
            "government": 0.3,
            "regulatory_body": 0.25,
            "legal": 0.2,
            "industry": 0.15,
            "news": 0.1
        }
        score += source_scores.get(source_type, 0.05)
        
        # Ensure score is between 0 and 1
        return min(max(score, 0.0), 1.0)
    
    def _get_industry_keywords(self, industry: str) -> List[str]:
        """Get keywords related to an industry"""
        
        industry_keywords = {
            "technology": ["software", "digital", "cybersecurity", "data", "AI", "automation"],
            "energy": ["energy", "power", "renewable", "solar", "wind", "fossil", "nuclear"],
            "healthcare": ["medical", "health", "pharmaceutical", "clinical", "patient", "drug"],
            "financial": ["banking", "finance", "investment", "insurance", "credit", "payment"],
            "manufacturing": ["production", "factory", "equipment", "machinery", "assembly"],
            "retail": ["consumer", "retail", "commerce", "shopping", "customer", "sales"]
        }
        
        industry_lower = industry.lower()
        for key, keywords in industry_keywords.items():
            if key in industry_lower:
                return keywords
        
        return []
    
    def _get_jurisdiction_keywords(self, jurisdiction: str) -> List[str]:
        """Get keywords related to a jurisdiction"""
        
        jurisdiction_keywords = {
            "us": ["united states", "usa", "federal", "state", "american"],
            "uk": ["united kingdom", "britain", "england", "scotland", "wales"],
            "eu": ["european union", "europe", "eu", "european"],
            "canada": ["canada", "canadian", "provincial"],
            "australia": ["australia", "australian", "state", "territory"]
        }
        
        jurisdiction_lower = jurisdiction.lower()
        for key, keywords in jurisdiction_keywords.items():
            if key in jurisdiction_lower:
                return keywords
        
        return []
    
    async def _rank_content(
        self,
        data: List[Dict[str, Any]],
        company_profile: CompanyProfile,
        analysis_type: str
    ) -> List[Dict[str, Any]]:
        """Rank content by importance and relevance"""
        
        for item in data:
            importance_score = self._calculate_importance_score(item, company_profile, analysis_type)
            item["importance_score"] = importance_score
        
        # Sort by combined score (relevance + importance)
        def sort_key(item):
            relevance = item.get("relevance_score", 0)
            importance = item.get("importance_score", 0)
            return (relevance + importance) / 2
        
        return sorted(data, key=sort_key, reverse=True)
    
    def _calculate_importance_score(
        self,
        item: Dict[str, Any],
        company_profile: CompanyProfile,
        analysis_type: str
    ) -> float:
        """Calculate importance score for an item"""
        
        score = 0.0
        
        # Source type importance
        source_type = item.get("source_type", "")
        source_importance = {
            "government": 0.4,
            "regulatory_body": 0.35,
            "legal": 0.3,
            "industry": 0.2,
            "news": 0.1
        }
        score += source_importance.get(source_type, 0.05)
        
        # Content length importance (longer content is often more detailed)
        content_length = len(item.get("content", ""))
        if content_length > 1000:
            score += 0.2
        elif content_length > 500:
            score += 0.1
        
        # Recency importance
        # For now, assume all content is recent
        score += 0.1
        
        # Analysis type specific importance
        if analysis_type == "comprehensive":
            # For comprehensive analysis, prefer detailed content
            if content_length > 500:
                score += 0.1
        elif analysis_type == "targeted":
            # For targeted analysis, prefer highly relevant content
            relevance = item.get("relevance_score", 0)
            if relevance > 0.8:
                score += 0.2
        
        return min(max(score, 0.0), 1.0)
    
    async def _remove_duplicates(self, data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicate content based on URL and title similarity"""
        
        seen_urls = set()
        seen_titles = set()
        deduplicated = []
        
        for item in data:
            url = item.get("url", "")
            title = item.get("title", "").lower()
            
            # Check for exact URL duplicates
            if url in seen_urls:
                continue
            
            # Check for title similarity
            title_words = set(title.split())
            is_duplicate = False
            
            for seen_title in seen_titles:
                seen_words = set(seen_title.split())
                # If more than 80% of words match, consider it a duplicate
                if len(title_words & seen_words) / len(title_words | seen_words) > 0.8:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                seen_urls.add(url)
                seen_titles.add(title)
                deduplicated.append(item)
        
        return deduplicated