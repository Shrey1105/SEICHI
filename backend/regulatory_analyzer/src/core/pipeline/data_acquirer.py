"""
Data Acquirer - Stage 2 of the AI analysis pipeline
Acquires regulatory data from various sources based on generated queries
"""

import logging
import asyncio
from typing import List, Dict, Any
import httpx
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class DataAcquirer:
    """Acquires regulatory data from various sources"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.http_client = httpx.AsyncClient(timeout=30.0)
    
    async def acquire_data(self, queries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Acquire data from various sources based on queries"""
        
        self.logger.info(f"Acquiring data for {len(queries)} queries")
        
        all_data = []
        
        # Group queries by priority
        high_priority_queries = [q for q in queries if q.get("priority") == "high"]
        medium_priority_queries = [q for q in queries if q.get("priority") == "medium"]
        low_priority_queries = [q for q in queries if q.get("priority") == "low"]
        
        # Process high priority queries first
        if high_priority_queries:
            high_priority_data = await self._process_queries_batch(high_priority_queries)
            all_data.extend(high_priority_data)
        
        # Process medium priority queries
        if medium_priority_queries:
            medium_priority_data = await self._process_queries_batch(medium_priority_queries)
            all_data.extend(medium_priority_data)
        
        # Process low priority queries
        if low_priority_queries:
            low_priority_data = await self._process_queries_batch(low_priority_queries)
            all_data.extend(low_priority_data)
        
        self.logger.info(f"Acquired {len(all_data)} data items")
        return all_data
    
    async def _process_queries_batch(self, queries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process a batch of queries concurrently"""
        
        tasks = []
        for query in queries:
            task = self._acquire_data_for_query(query)
            tasks.append(task)
        
        # Process queries concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and flatten results
        data = []
        for result in results:
            if isinstance(result, Exception):
                self.logger.error(f"Query failed: {result}")
            elif isinstance(result, list):
                data.extend(result)
            elif result:
                data.append(result)
        
        return data
    
    async def _acquire_data_for_query(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Acquire data for a single query"""
        
        query_text = query.get("query", "")
        query_type = query.get("type", "keyword_search")
        
        self.logger.info(f"Acquiring data for query: {query_text}")
        
        data = []
        
        # Acquire from different sources based on query type
        if query_type == "keyword_search":
            data.extend(await self._search_government_sites(query_text))
            data.extend(await self._search_regulatory_bodies(query_text))
            data.extend(await self._search_news_sources(query_text))
        elif query_type == "industry_search":
            data.extend(await self._search_industry_sources(query_text))
        elif query_type == "jurisdiction_search":
            data.extend(await self._search_jurisdiction_sources(query_text))
        
        return data
    
    async def _search_government_sites(self, query: str) -> List[Dict[str, Any]]:
        """Search government websites for regulatory information"""
        
        government_sites = [
            "https://www.gov.uk/search?q=",
            "https://www.usa.gov/search?query=",
            "https://ec.europa.eu/search?query=",
            "https://www.federalregister.gov/search?q="
        ]
        
        data = []
        
        for site in government_sites:
            try:
                # Simulate API call to government site
                search_url = f"{site}{query}"
                
                # Mock response for demo purposes
                mock_data = {
                    "source": "government_site",
                    "url": search_url,
                    "title": f"Government regulation: {query}",
                    "content": f"Official government information about {query}",
                    "date": datetime.utcnow().isoformat(),
                    "relevance_score": 0.9,
                    "source_type": "government"
                }
                
                data.append(mock_data)
                
            except Exception as e:
                self.logger.error(f"Failed to search government site {site}: {e}")
        
        return data
    
    async def _search_regulatory_bodies(self, query: str) -> List[Dict[str, Any]]:
        """Search regulatory body websites"""
        
        regulatory_bodies = [
            "SEC", "FDA", "EPA", "FTC", "FCC",  # US
            "FCA", "MHRA", "HSE", "Ofcom",      # UK
            "EMA", "EFSA", "EASA", "ACER"       # EU
        ]
        
        data = []
        
        for body in regulatory_bodies:
            try:
                # Mock regulatory body search
                mock_data = {
                    "source": "regulatory_body",
                    "url": f"https://{body.lower()}.gov/search?q={query}",
                    "title": f"{body} regulation: {query}",
                    "content": f"Regulatory guidance from {body} regarding {query}",
                    "date": datetime.utcnow().isoformat(),
                    "relevance_score": 0.85,
                    "source_type": "regulatory_body",
                    "regulatory_body": body
                }
                
                data.append(mock_data)
                
            except Exception as e:
                self.logger.error(f"Failed to search regulatory body {body}: {e}")
        
        return data
    
    async def _search_news_sources(self, query: str) -> List[Dict[str, Any]]:
        """Search news sources for regulatory updates"""
        
        news_sources = [
            "Reuters", "Bloomberg", "Financial Times", "Wall Street Journal"
        ]
        
        data = []
        
        for source in news_sources:
            try:
                # Mock news search
                mock_data = {
                    "source": "news_source",
                    "url": f"https://{source.lower().replace(' ', '')}.com/search?q={query}",
                    "title": f"Regulatory update: {query}",
                    "content": f"Latest news from {source} about regulatory changes related to {query}",
                    "date": datetime.utcnow().isoformat(),
                    "relevance_score": 0.7,
                    "source_type": "news",
                    "news_source": source
                }
                
                data.append(mock_data)
                
            except Exception as e:
                self.logger.error(f"Failed to search news source {source}: {e}")
        
        return data
    
    async def _search_industry_sources(self, query: str) -> List[Dict[str, Any]]:
        """Search industry-specific sources"""
        
        data = []
        
        # Mock industry source search
        mock_data = {
            "source": "industry_source",
            "url": f"https://industry-standards.org/search?q={query}",
            "title": f"Industry standard: {query}",
            "content": f"Industry-specific guidance and standards for {query}",
            "date": datetime.utcnow().isoformat(),
            "relevance_score": 0.8,
            "source_type": "industry"
        }
        
        data.append(mock_data)
        
        return data
    
    async def _search_jurisdiction_sources(self, query: str) -> List[Dict[str, Any]]:
        """Search jurisdiction-specific sources"""
        
        data = []
        
        # Mock jurisdiction source search
        mock_data = {
            "source": "jurisdiction_source",
            "url": f"https://legal-database.gov/search?q={query}",
            "title": f"Legal requirement: {query}",
            "content": f"Jurisdiction-specific legal requirements for {query}",
            "date": datetime.utcnow().isoformat(),
            "relevance_score": 0.9,
            "source_type": "legal"
        }
        
        data.append(mock_data)
        
        return data
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.http_client.aclose()