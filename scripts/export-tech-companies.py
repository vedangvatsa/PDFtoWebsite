import sqlite3
import csv
import os

TECH_ATS = [
  'ashbyhq', 
  'leverco', 
  'greenhouse', 
  'gem', 
  'jobvite',
  'rippling',
  'recruitee',
  'teamtailor'
]

def export_tech_companies():
    db_path = os.path.join(os.path.dirname(__file__), '..', 'scratch', 'OpenPostings', 'jobs.db')
    out_path = os.path.join(os.path.dirname(__file__), 'tech-companies-to-scrape.csv')
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    placeholders = ','.join(['?'] * len(TECH_ATS))
    query = f"""
        SELECT company_name, url_string, ATS_name 
        FROM companies 
        WHERE ATS_name IN ({placeholders})
        ORDER BY ATS_name, company_name
    """
    
    cursor.execute(query, TECH_ATS)
    results = cursor.fetchall()
    
    print(f"Found {len(results)} tech companies.")
    
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Company Name', 'Job Board URL', 'ATS Provider'])
        for row in results:
            writer.writerow(row)
            
    print(f"Exported to {out_path}")
    conn.close()

if __name__ == '__main__':
    export_tech_companies()
