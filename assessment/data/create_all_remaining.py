import json

# All remaining categories with questions
all_categories = {
    "medtech": [
        ("medtech_001", "operations", "What is your FDA regulatory pathway?", "510(k), PMA, or De Novo classification"),
        ("medtech_002", "technology", "What is your device classification?", "Class I, II, or III medical device"),
        ("medtech_003", "operations", "Do you have ISO 13485 certification?", "Quality management for medical devices"),
        ("medtech_004", "customer", "How many clinical sites are using your device?", "Hospital/clinic adoption"),
        ("medtech_005", "financial", "What is your reimbursement status?", "CPT codes and insurance coverage"),
        ("medtech_006", "technology", "Have you completed design verification?", "V&V testing and documentation"),
        ("medtech_007", "operations", "What is your manufacturing capability?", "In-house or contract manufacturing"),
        ("medtech_008", "customer", "What is your clinical evidence strength?", "RCT, case studies, or publications"),
        ("medtech_009", "business", "Do you have key opinion leader endorsements?", "Physician champions and advocates"),
        ("medtech_010", "financial", "What is your average selling price (ASP)?", "Revenue per device"),
        ("medtech_011", "operations", "Do you have MDR/IVDR compliance (EU)?", "European regulatory compliance"),
        ("medtech_012", "technology", "What is your device reliability/uptime?", "Mean time between failures"),
        ("medtech_013", "customer", "What is your user training completion rate?", "Healthcare provider training"),
        ("medtech_014", "business", "Do you have distribution partnerships?", "GPO, distributor, or direct sales"),
        ("medtech_015", "operations", "What is your post-market surveillance system?", "Adverse event monitoring")
    ],
    "foodtech": [
        ("food_001", "operations", "What food safety certifications do you have?", "HACCP, SQF, GFSI, FDA registration"),
        ("food_002", "operations", "What is your supply chain traceability?", "Farm to fork tracking capability"),
        ("food_003", "financial", "What is your gross margin per SKU?", "Profit after COGS"),
        ("food_004", "customer", "What is your customer repeat purchase rate?", "% buying again"),
        ("food_005", "technology", "Do you use cold chain monitoring?", "Temperature tracking and IoT"),
        ("food_006", "operations", "What is your shelf life management?", "Freshness and inventory turnover"),
        ("food_007", "financial", "What is your food cost percentage?", "Ingredient cost as % of revenue"),
        ("food_008", "customer", "What is your average order value?", "Revenue per transaction"),
        ("food_009", "business", "How many retail/restaurant partnerships?", "Distribution channels"),
        ("food_010", "operations", "What is your fulfillment time?", "Order to delivery speed"),
        ("food_011", "technology", "Do you have demand forecasting?", "Predictive inventory management"),
        ("food_012", "customer", "What is your NPS score?", "Customer satisfaction"),
        ("food_013", "operations", "What is your waste/spoilage rate?", "% of product that doesn't sell"),
        ("food_014", "business", "Do you have sustainable sourcing?", "Organic, local, ethical sourcing"),
        ("food_015", "financial", "What is your CAC?", "Customer acquisition cost")
    ],
    "retailtech": [
        ("retail_001", "technology", "What POS system capabilities do you have?", "Point of sale technology"),
        ("retail_002", "customer", "What is your omnichannel integration?", "Online + offline experience"),
        ("retail_003", "operations", "What is your inventory turnover rate?", "How fast inventory sells"),
        ("retail_004", "financial", "What is your average transaction value?", "Revenue per purchase"),
        ("retail_005", "technology", "Do you have clienteling/CRM?", "Customer relationship management"),
        ("retail_006", "customer", "What is your foot traffic analytics capability?", "In-store customer tracking"),
        ("retail_007", "operations", "What is your stock-out rate?", "% of time products unavailable"),
        ("retail_008", "financial", "What is your same-store sales growth?", "Comparable store performance"),
        ("retail_009", "technology", "Do you have dynamic pricing?", "AI-powered price optimization"),
        ("retail_010", "customer", "What is your loyalty program enrollment?", "% of customers in loyalty"),
        ("retail_011", "operations", "What is your employee turnover rate?", "Retail staff retention"),
        ("retail_012", "business", "How many retail locations/clients?", "Market penetration"),
        ("retail_013", "technology", "Do you have AR/VR capabilities?", "Virtual try-on, visualization"),
        ("retail_014", "customer", "What is your mobile payment adoption?", "% of mobile transactions"),
        ("retail_015", "financial", "What is your sales per square foot?", "Store productivity metric")
    ],
    "proptech": [
        ("prop_001", "financial", "What is your property portfolio value?", "Total real estate managed"),
        ("prop_002", "customer", "What is your occupancy rate?", "% of units/space occupied"),
        ("prop_003", "technology", "Do you have smart building integration?", "IoT sensors and automation"),
        ("prop_004", "operations", "What is your tenant satisfaction score?", "NPS or satisfaction survey"),
        ("prop_005", "financial", "What is your rent collection rate?", "% collected on time"),
        ("prop_006", "technology", "Do you have virtual touring capability?", "3D tours, VR showings"),
        ("prop_007", "operations", "What is your maintenance response time?", "Ticket to resolution time"),
        ("prop_008", "customer", "What is your lease renewal rate?", "% of tenants renewing"),
        ("prop_009", "business", "How many properties/units managed?", "Scale of operations"),
        ("prop_010", "financial", "What is your CAC per tenant?", "Marketing cost per lease"),
        ("prop_011", "technology", "Do you have energy management systems?", "Smart energy optimization"),
        ("prop_012", "operations", "What is your vacancy time?", "Days from move-out to move-in"),
        ("prop_013", "customer", "What is your showing-to-lease conversion?", "% of tours that convert"),
        ("prop_014", "business", "Do you have property management partnerships?", "PM company relationships"),
        ("prop_015", "financial", "What is your net operating income growth?", "NOI improvement rate")
    ],
    "logisticstech": [
        ("log_001", "operations", "What is your on-time delivery rate?", "% of deliveries on schedule"),
        ("log_002", "financial", "What is your cost per delivery?", "Average logistics cost"),
        ("log_003", "technology", "Do you have route optimization?", "AI-powered routing"),
        ("log_004", "customer", "What is your customer satisfaction (CSAT)?", "Delivery experience rating"),
        ("log_005", "operations", "What is your vehicle utilization rate?", "Efficiency of fleet usage"),
        ("log_006", "technology", "Do you have real-time tracking?", "GPS and shipment visibility"),
        ("log_007", "financial", "What is your fuel efficiency?", "MPG or cost per mile"),
        ("log_008", "operations", "What is your warehouse automation level?", "Robotics and automation %"),
        ("log_009", "customer", "What is your damage/loss rate?", "% of shipments damaged"),
        ("log_010", "business", "How many delivery zones covered?", "Geographic coverage"),
        ("log_011", "technology", "Do you have predictive maintenance?", "IoT fleet monitoring"),
        ("log_012", "operations", "What is your return/reverse logistics capability?", "Returns processing"),
        ("log_013", "financial", "What is your revenue per vehicle?", "Fleet productivity"),
        ("log_014", "customer", "What is your first-attempt delivery success?", "% delivered first try"),
        ("log_015", "technology", "Do you have last-mile optimization?", "Final delivery efficiency")
    ],
    "cleantech": [
        ("clean_001", "operations", "What is your carbon reduction impact?", "Tons of CO2 prevented"),
        ("clean_002", "financial", "What is your energy cost savings?", "Customer savings delivered"),
        ("clean_003", "technology", "What is your energy efficiency gain?", "% improvement in efficiency"),
        ("clean_004", "business", "How many installations/deployments?", "Customer adoption scale"),
        ("clean_005", "operations", "Do you have environmental certifications?", "LEED, Energy Star, B-Corp"),
        ("clean_006", "financial", "What is your payback period for customers?", "ROI timeline"),
        ("clean_007", "technology", "What renewable energy source?", "Solar, wind, hydro, etc."),
        ("clean_008", "customer", "What is your customer energy savings %?", "Measured impact"),
        ("clean_009", "operations", "What is your system uptime/reliability?", "Operational consistency"),
        ("clean_010", "financial", "Do you have government incentives/credits?", "Tax credits, grants, subsidies"),
        ("clean_011", "business", "Do you have utility partnerships?", "Energy company relationships"),
        ("clean_012", "technology", "What is your grid integration capability?", "Smart grid compatibility"),
        ("clean_013", "customer", "What is your NPS score?", "Customer satisfaction"),
        ("clean_014", "operations", "What is your supply chain sustainability?", "Ethical sourcing, circular economy"),
        ("clean_015", "financial", "What is your carbon credit revenue?", "Monetization of offsets")
    ],
    "legaltech": [
        ("legal_001", "technology", "What legal workflows do you automate?", "Contract review, discovery, etc."),
        ("legal_002", "customer", "How many law firms/legal depts use you?", "Client base"),
        ("legal_003", "operations", "What is your accuracy rate?", "AI/automation accuracy"),
        ("legal_004", "financial", "What time/cost savings do you deliver?", "% reduction in legal work"),
        ("legal_005", "technology", "Do you have NLP/AI capabilities?", "Natural language processing"),
        ("legal_006", "customer", "What is your user adoption rate?", "% of law firm using daily"),
        ("legal_007", "operations", "Do you have security/compliance certs?", "SOC 2, ISO, data protection"),
        ("legal_008", "business", "What practice areas do you serve?", "Litigation, corporate, IP, etc."),
        ("legal_009", "financial", "What is your average contract value?", "ACV per client"),
        ("legal_010", "customer", "What is your NPS score?", "Attorney satisfaction"),
        ("legal_011", "technology", "Do you have document assembly?", "Automated document generation"),
        ("legal_012", "operations", "What is your e-discovery capability?", "Large-scale doc review"),
        ("legal_013", "business", "Do you integrate with legal software?", "Clio, Westlaw, LexisNexis"),
        ("legal_014", "financial", "What is your gross margin?", "Profitability metric"),
        ("legal_015", "customer", "What is your case win rate improvement?", "Measured client outcomes")
    ],
    "regtech": [
        ("reg_001", "operations", "What regulations do you cover?", "AML, KYC, GDPR, SOX, etc."),
        ("reg_002", "technology", "What is your automation level?", "% of compliance automated"),
        ("reg_003", "customer", "How many regulated entities use you?", "Banks, fintechs, etc."),
        ("reg_004", "operations", "What is your false positive rate?", "Alert accuracy"),
        ("reg_005", "financial", "What cost reduction do you deliver?", "Compliance cost savings %"),
        ("reg_006", "technology", "Do you have AI/ML for risk detection?", "Intelligent monitoring"),
        ("reg_007", "operations", "What is your audit success rate?", "% of clients passing audits"),
        ("reg_008", "business", "Do you have regulator partnerships?", "Regulatory sandbox, feedback"),
        ("reg_009", "financial", "What is your ACV?", "Average contract value"),
        ("reg_010", "customer", "What is your customer retention?", "Annual renewal rate"),
        ("reg_011", "technology", "Do you have real-time monitoring?", "Live compliance tracking"),
        ("reg_012", "operations", "What is your reporting automation?", "Automated regulatory filings"),
        ("reg_013", "business", "How many jurisdictions covered?", "Geographic regulatory coverage"),
        ("reg_014", "financial", "What is your gross margin?", "Profitability"),
        ("reg_015", "customer", "What is your time-to-compliance?", "Onboarding to compliant")
    ],
    "hrtech": [
        ("hr_001", "customer", "How many employees managed on platform?", "User base scale"),
        ("hr_002", "operations", "What is your employee engagement score?", "Satisfaction metrics"),
        ("hr_003", "financial", "What is your CAC?", "Customer acquisition cost"),
        ("hr_004", "technology", "What HR workflows do you automate?", "Recruiting, onboarding, payroll"),
        ("hr_005", "customer", "What is your time-to-hire reduction?", "Recruiting efficiency"),
        ("hr_006", "operations", "What is your employee retention impact?", "Measured retention improvement"),
        ("hr_007", "financial", "What is your NRR?", "Net revenue retention"),
        ("hr_008", "business", "What company sizes do you serve?", "SMB, mid-market, enterprise"),
        ("hr_009", "technology", "Do you have AI-powered matching?", "Candidate or skill matching"),
        ("hr_010", "customer", "What is your NPS?", "Customer satisfaction"),
        ("hr_011", "operations", "What integrations do you have?", "ATS, HRIS, payroll systems"),
        ("hr_012", "financial", "What is your average contract value?", "ACV per customer"),
        ("hr_013", "business", "Do you have diversity/inclusion metrics?", "DEI tracking capabilities"),
        ("hr_014", "customer", "What is your user adoption rate?", "% of employees using"),
        ("hr_015", "technology", "Do you have predictive analytics?", "Turnover prediction, skills gaps")
    ],
    "edtech": [
        ("ed_001", "customer", "How many students/learners on platform?", "User base"),
        ("ed_002", "operations", "What learning outcomes do you measure?", "Test scores, completion, etc."),
        ("ed_003", "financial", "What is your CAC?", "Customer acquisition cost"),
        ("ed_004", "customer", "What is your course completion rate?", "% finishing courses"),
        ("ed_005", "technology", "Do you have adaptive learning?", "Personalized learning paths"),
        ("ed_006", "business", "How many institutions/schools use you?", "B2B customer base"),
        ("ed_007", "operations", "What is your content quality score?", "Peer reviews, accreditation"),
        ("ed_008", "financial", "What is your NRR?", "Net revenue retention"),
        ("ed_009", "customer", "What learning improvement do students show?", "Pre/post test gains"),
        ("ed_010", "technology", "Do you have mobile learning?", "App and offline capability"),
        ("ed_011", "business", "What grade levels/subjects covered?", "Curriculum breadth"),
        ("ed_012", "customer", "What is your student engagement score?", "Time on platform, activity"),
        ("ed_013", "operations", "Do you have accreditation/certification?", "Recognized credentials"),
        ("ed_014", "financial", "What is your gross margin?", "Profitability"),
        ("ed_015", "customer", "What is your NPS?", "Student/teacher satisfaction")
    ],
    "socialimpact": [
        ("impact_001", "customer", "How many beneficiaries served?", "People impacted"),
        ("impact_002", "operations", "What SDGs do you address?", "UN Sustainable Development Goals"),
        ("impact_003", "financial", "What is your impact per dollar?", "Efficiency of impact"),
        ("impact_004", "business", "Do you have impact measurement framework?", "IRIS, GIIRS, Theory of Change"),
        ("impact_005", "customer", "What measurable outcomes achieved?", "Lives improved, emissions reduced"),
        ("impact_006", "financial", "What is your revenue model?", "Grants, earned revenue, hybrid"),
        ("impact_007", "operations", "Do you have B-Corp or similar certification?", "Impact certification"),
        ("impact_008", "business", "How many stakeholder partnerships?", "NGOs, governments, corporates"),
        ("impact_009", "customer", "What is your beneficiary satisfaction?", "Feedback from those served"),
        ("impact_010", "financial", "What is your cost per beneficiary?", "Efficiency metric"),
        ("impact_011", "technology", "Do you have impact tracking technology?", "Data collection systems"),
        ("impact_012", "operations", "What is your program scalability?", "Geographic/population expansion"),
        ("impact_013", "business", "Do you have grant/funding track record?", "Foundation support"),
        ("impact_014", "financial", "What is your sustainability model?", "Path to financial self-sufficiency"),
        ("impact_015", "customer", "What is your community engagement level?", "Participation rates")
    ]
}

# Define scoring options for different question patterns
scoring_patterns = {
    "count_low": [
        {"text": "None", "score": 0},
        {"text": "1-2", "score": 2},
        {"text": "3-5", "score": 3.5},
        {"text": "6-10", "score": 4.5},
        {"text": "10+", "score": 5}
    ],
    "count_high": [
        {"text": "None", "score": 0},
        {"text": "1-10", "score": 2},
        {"text": "11-50", "score": 3.5},
        {"text": "51-200", "score": 4.5},
        {"text": "200+", "score": 5}
    ],
    "percentage": [
        {"text": "Not tracking", "score": 0},
        {"text": "Below 60%", "score": 2},
        {"text": "60-75%", "score": 3.5},
        {"text": "75-90%", "score": 4.5},
        {"text": "Above 90%", "score": 5}
    ],
    "maturity": [
        {"text": "Not started", "score": 0},
        {"text": "Planning", "score": 2},
        {"text": "In progress", "score": 3.5},
        {"text": "Implemented", "score": 4.5},
        {"text": "Optimized", "score": 5}
    ],
    "yes_no": [
        {"text": "No", "score": 0},
        {"text": "Planning", "score": 2},
        {"text": "Partial", "score": 3.5},
        {"text": "Yes", "score": 4.5},
        {"text": "Advanced", "score": 5}
    ]
}

# Create files with appropriate scoring
for category, questions in all_categories.items():
    file_data = {
        "category": category,
        "industryQuestions": []
    }
    
    for q_id, dimension, text, help_text in questions:
        # Choose appropriate scoring pattern based on question
        if "rate" in text.lower() or "%" in text.lower():
            options = scoring_patterns["percentage"]
        elif "how many" in text.lower():
            options = scoring_patterns["count_high"]
        elif "do you have" in text.lower():
            options = scoring_patterns["yes_no"]
        else:
            options = scoring_patterns["maturity"]
        
        question = {
            "id": q_id,
            "dimension": dimension,
            "text": text,
            "help": help_text,
            "type": "multiple",
            "options": options
        }
        file_data["industryQuestions"].append(question)
    
    with open(f"questions-{category}.json", "w") as f:
        json.dump(file_data, f, indent=2)
    
    print(f"✅ Created questions-{category}.json (15 questions)")

print("\n🎉 All remaining categories complete!")
print("📊 Total: 11 categories × 15 questions = 165 questions")
