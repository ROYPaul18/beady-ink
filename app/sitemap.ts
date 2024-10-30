export default async function sitemap() {
    const baseUrl = "https://beaudy-ink.com";
  
    // Routes statiques en français
    const routes = [
      "/",     
      "/profile",   
      "/reservation",
      "/reservation/onglerie",
      "/reservation/onglerie/calendar",
      "/reservation/tatouage", 
      "/reservation/tattoo",             // Page d'accueil
      "/tatouage",             // Section tatouage
      "/tattoo",     // Galerie tatouages
      "/onglerie",
      "/admin",             // Section onglerie
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    }));
  
    return [...routes];
  }