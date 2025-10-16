"""
Query Generator - Stage 1 of the AI analysis pipeline
Generates targeted search queries based on company profile and analysis requirements
"""

from typing import List, Dict, Any
import json

class QueryGenerator:
    """Generates search queries for regulatory data acquisition"""
    
    def __init__(self):
        self.base_queries = [
            "regulatory changes",
            "compliance updates",
            "new regulations",
            "regulatory announcements"
        ]
    
    async def generate_queries(
        self,
        company_profile: Any,
        analysis_type: str = "comprehensive",
        scope: str = None,
        keywords: List[str] = None
    ) -> List[Dict[str, Any]]:
        """Generate targeted search queries"""
        
        queries = []
        
        # Base queries for the industry
        if company_profile.industry:
            industry_queries = [
                f"{company_profile.industry} regulations",
                f"{company_profile.industry} compliance",
                f"{company_profile.industry} regulatory changes"
            ]
            queries.extend(industry_queries)
        
        # Jurisdiction-specific queries
        if company_profile.jurisdiction:
            jurisdiction_queries = [
                f"{company_profile.jurisdiction} regulations",
                f"{company_profile.jurisdiction} compliance requirements",
                f"{company_profile.jurisdiction} regulatory updates"
            ]
            queries.extend(jurisdiction_queries)
        
        # Company-specific queries
        if company_profile.company_name:
            company_queries = [
                f"{company_profile.company_name} regulatory requirements",
                f"{company_profile.company_name} compliance obligations"
            ]
            queries.extend(company_queries)
        
        # Custom keywords
        if keywords:
            for keyword in keywords:
                queries.append(f"{keyword} regulations")
                queries.append(f"{keyword} compliance")
        
        # Scope-specific queries
        if scope:
            scope_queries = [
                f"{scope} regulatory changes",
                f"{scope} compliance updates"
            ]
            queries.extend(scope_queries)
        
        # Analysis type specific queries
        if analysis_type == "comprehensive":
            comprehensive_queries = [
                "regulatory landscape changes",
                "compliance framework updates",
                "regulatory risk assessment"
            ]
            queries.extend(comprehensive_queries)
        elif analysis_type == "targeted":
            targeted_queries = [
                "specific regulatory changes",
                "targeted compliance requirements"
            ]
            queries.extend(targeted_queries)
        elif analysis_type == "monitoring":
            monitoring_queries = [
                "regulatory monitoring",
                "compliance tracking",
                "regulatory alerts"
            ]
            queries.extend(monitoring_queries)
        
        # Remove duplicates and create query objects
        unique_queries = list(set(queries))
        query_objects = []
        
        for query in unique_queries:
            query_obj = {
                "query": query,
                "type": "web_search",
                "priority": self._calculate_priority(query, company_profile),
                "metadata": {
                    "company_profile_id": company_profile.id,
                    "analysis_type": analysis_type,
                    "generated_at": "2024-01-01T00:00:00Z"
                }
            }
            query_objects.append(query_obj)
        
        return query_objects
    
    def _calculate_priority(self, query: str, company_profile: Any) -> int:
        """Calculate query priority based on relevance"""
        priority = 1  # Default priority
        
        # Higher priority for company-specific queries
        if company_profile.company_name and company_profile.company_name.lower() in query.lower():
            priority += 2
        
        # Higher priority for industry-specific queries
        if company_profile.industry and company_profile.industry.lower() in query.lower():
            priority += 1
        
        # Higher priority for jurisdiction-specific queries
        if company_profile.jurisdiction and company_profile.jurisdiction.lower() in query.lower():
            priority += 1
        
        return min(priority, 5)  # Max priority of 5
