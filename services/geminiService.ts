import { GoogleGenAI, Type } from "@google/genai";
import { Product, SalesOrder, JournalEntry } from "../types";

// Initialize Gemini Client
// NOTE: Ideally this comes from process.env.API_KEY, but for this demo context we assume it's injected or set.
const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

export const generateDemandForecast = async (
  productName: string,
  salesHistory: SalesOrder[],
  currentStock: number
): Promise<any> => {
  if (!apiKey) return { error: "API Key missing" };

  const model = "gemini-2.5-flash";
  
  // Aggregate simplified history for the prompt
  const recentSales = salesHistory.slice(-50).map(s => ({
    date: s.date,
    qty: s.items.filter(i => i.productName === productName).reduce((acc, curr) => acc + curr.quantity, 0)
  })).filter(s => s.qty > 0);

  const prompt = `
    You are an AI Supply Chain Analyst for a bakery ingredient supplier.
    Product: ${productName}
    Current Stock: ${currentStock}
    Recent Daily Sales Data (JSON): ${JSON.stringify(recentSales)}
    
    Task: Predict the demand for the next 7 days and recommend if we need to restock immediately considering the perishable nature of baking ingredients.
    
    Return JSON format:
    {
      "predictedDemand": number,
      "restockRecommendation": "Urgent" | "Normal" | "None",
      "reasoning": "short explanation"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedDemand: { type: Type.NUMBER },
            restockRecommendation: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Forecasting Error:", error);
    return null;
  }
};

export const analyzeFinancialHealth = async (
  entries: JournalEntry[],
  period: string
): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate analysis.";

  const model = "gemini-2.5-flash";
  
  // Summarize for token efficiency
  const revenue = entries.filter(e => e.creditAccount === 'Sales Revenue').reduce((a, b) => a + b.amount, 0);
  const cogs = entries.filter(e => e.debitAccount === 'COGS').reduce((a, b) => a + b.amount, 0);
  const profit = revenue - cogs;

  const prompt = `
    Role: Senior Accounting Professor & Financial Analyst.
    Context: Analysis for Baking Ingredient ERP.
    Period: ${period}
    Data:
    - Total Revenue: ${revenue}
    - Cost of Goods Sold (COGS): ${cogs}
    - Gross Profit: ${profit}
    
    Provide a concise executive summary (max 100 words) on the financial health and margin analysis. Mention if the margin is healthy for a retail food business (typically 20-40%).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error generating analysis.";
  }
};