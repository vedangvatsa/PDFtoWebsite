import sqlite3
import csv

def extract_tech_companies():
    conn = sqlite3.connect('/Users/vedang/PDFtoWebsite/scratch/OpenPostings/jobs.db')
    cursor = conn.cursor()
    
    # Query companies with a high percentage/number of tech jobs
    # A tech job is identified by keywords in position_name
    query = """
        SELECT 
            c.company_name, 
            c.url_string,
            c.ATS_name,
            COUNT(p.id) as total_jobs,
            SUM(CASE WHEN 
                p.position_name LIKE '%software%' OR 
                p.position_name LIKE '%engineer%' OR 
                p.position_name LIKE '%developer%' OR 
                p.position_name LIKE '%data%' OR 
                p.position_name LIKE '%product manager%' OR 
                p.position_name LIKE '%frontend%' OR 
                p.position_name LIKE '%backend%' OR 
                p.position_name LIKE '%fullstack%' OR 
                p.position_name LIKE '%cloud%' OR 
                p.position_name LIKE '%devops%' OR
                p.position_name LIKE '%ai%' OR
                p.position_name LIKE '%machine learning%'
                THEN 1 ELSE 0 END) as tech_jobs
        FROM companies c
        LEFT JOIN Postings p ON c.company_name = p.company_name
        GROUP BY c.company_name
        HAVING tech_jobs > 0 AND total_jobs > 0
        ORDER BY tech_jobs DESC, total_jobs DESC
    """
    
    cursor.execute(query)
    results = cursor.fetchall()
    
    tech_companies = []
    for row in results:
        company_name, url_string, ats_name, total_jobs, tech_jobs = row
        # To ensure it's a tech company, let's say at least 20% of their open jobs are tech jobs,
        # or they have more than 5 tech jobs open
        if tech_jobs >= 3 and (tech_jobs / total_jobs) >= 0.2:
            tech_companies.append({
                'company_name': company_name,
                'url_string': url_string,
                'ats_name': ats_name,
                'total_jobs': total_jobs,
                'tech_jobs': tech_jobs
            })
            
    print(f"Found {len(tech_companies)} tech companies.")
    
    # Write to a CSV
    with open('/Users/vedang/PDFtoWebsite/scratch/tech_companies.csv', 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['company_name', 'url_string', 'ats_name', 'total_jobs', 'tech_jobs'])
        writer.writeheader()
        writer.writerows(tech_companies)
        
    conn.close()

if __name__ == '__main__':
    extract_tech_companies()
