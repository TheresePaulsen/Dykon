export function getDuvetRecommendation(temp: number): string {
    if (temp < 5) {
        return "Vinterdyne"; 
    }
    if (temp < 15) {
        return "Helårsdyne"; 
    }
    return "Sommerdyne";
}