"""
Query Generator - Stage 1 of the AI analysis pipeline
Generates search queries based on company profile and analysis requirements
"""

import logging
from typing import List, Dict, Any
from ...database.models import CompanyProfile

logger = logging.getLogger(__name__)

class QueryGenerator:
    """Generates search queries for regulatory data acquisition"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def generate_queries(
        self,
        company_profile: CompanyProfile,
        analysis_type: str = "comprehensive",
        scope: str = None,
        keywords: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate search queries based on company profile and requirements"""
        
        self.logger.info(f"Generating queries for {company_profile.company_name}")
        
        queries = []
        
        # Base queries from company keywords
        if company_profile.keywords:
            for keyword in company_profile.keywords:
                queries.append({
                    "query": keyword,
                    "type": "keyword_search",
                    "source": "company_profile",
                    "priority": "high"
                })
        
        # Additional keywords from analysis request
        if keywords:
            for keyword in keywords:
                queries.append({
                    "query": keyword,
                    "type": "keyword_search",
                    "source": "analysis_request",
                    "priority": "medium"
                })
        
        # Industry-specific queries
        if company_profile.industry:
            industry_queries = self._get_industry_queries(company_profile.industry)
            queries.extend(industry_queries)
        
        # Jurisdiction-specific queries
        if company_profile.jurisdiction:
            jurisdiction_queries = self._get_jurisdiction_queries(company_profile.jurisdiction)
            queries.extend(jurisdiction_queries)
        
        # Analysis type specific queries
        if analysis_type == "comprehensive":
            comprehensive_queries = self._get_comprehensive_queries(company_profile)
            queries.extend(comprehensive_queries)
        elif analysis_type == "targeted":
            targeted_queries = self._get_targeted_queries(company_profile, scope)
            queries.extend(targeted_queries)
        
        self.logger.info(f"Generated {len(queries)} queries")
        return queries
    
    def _get_industry_queries(self, industry: str) -> List[Dict[str, Any]]:
        """Generate industry-specific queries"""
        industry_mapping = {
            "technology": [
                "data protection regulations",
                "cybersecurity compliance",
                "software licensing laws",
                "AI governance regulations"
            ],
            "energy": [
                "environmental regulations",
                "safety standards",
                "energy efficiency requirements",
                "renewable energy policies"
            ],
            "healthcare": [
                "medical device regulations",
                "patient data privacy",
                "clinical trial requirements",
                "healthcare compliance"
            ],
            "financial": [
                "financial services regulations",
                "anti-money laundering",
                "consumer protection laws",
                "banking compliance"
            ]
        }
        
        queries = []
        industry_lower = industry.lower()
        
        for key, terms in industry_mapping.items():
            if key in industry_lower:
                for term in terms:
                    queries.append({
                        "query": term,
                        "type": "industry_search",
                        "source": "industry_mapping",
                        "priority": "high"
                    })
        
        return queries
    
    def _get_jurisdiction_queries(self, jurisdiction: str) -> List[Dict[str, Any]]:
        """Generate jurisdiction-specific queries"""
        jurisdiction_mapping = {
            "us": [
                "federal regulations",
                "state compliance requirements",
                "SEC regulations",
                "FDA guidelines"
            ],
            "eu": [
                "EU directives",
                "GDPR compliance",
                "CE marking requirements",
                "European standards"
            ],
            "uk": [
                "UK regulations",
                "post-Brexit compliance",
                "British standards",
                "UKCA marking"
            ]
        }
        
        queries = []
        jurisdiction_lower = jurisdiction.lower()
        
        for key, terms in jurisdiction_mapping.items():
            if key in jurisdiction_lower:
                for term in terms:
                    queries.append({
                        "query": term,
                        "type": "jurisdiction_search",
                        "source": "jurisdiction_mapping",
                        "priority": "high"
                    })
        
        return queries
    
    def _get_comprehensive_queries(self, company_profile: CompanyProfile) -> List[Dict[str, Any]]:
        """Generate comprehensive analysis queries"""
        queries = []
        
        # General regulatory queries
        general_queries = [
            "regulatory changes",
            "compliance updates",
            "new legislation",
            "policy updates",
            "regulatory guidance"
        ]
        
        for query in general_queries:
            queries.append({
                "query": query,
                "type": "comprehensive_search",
                "source": "comprehensive_analysis",
                "priority": "medium"
            })
        
        return queries
    
    def _get_targeted_queries(self, company_profile: CompanyProfile, scope: str) -> List[Dict[str, Any]]:
        """Generate targeted analysis queries based on scope"""
        queries = []
        
        if scope:
            # Parse scope for specific terms
            scope_terms = scope.lower().split()
            for term in scope_terms:
                if len(term) > 3:  # Filter out short words
                    queries.append({
                        "query": term,
                        "type": "targeted_search",
                        "source": "scope_analysis",
                        "priority": "high"
                    })
        
        return queries