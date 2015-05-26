var DCT = {
  "This player can only load PDFs created by Livescribe. Please select a Livescribe PDF.": {
    "fr" : "Ce joueur ne peut charger que des fichiers PDF créés par Livescribe. S'il vous plaît sélectionner un Livescribe PDF.",
    "de" : "Dieser Spieler kann nur PDFs erstellt von Livescribe zu laden. Bitte wählen Sie ein Livescribe PDF.",
    "es" : "Este jugador sólo puede cargar archivos PDF creados por Livescribe. Por favor, seleccione un PDF Livescribe.",
    "zh" : "这个播放器只能加载PDF文件由Livescribe公司创建的。请选择一个Livescribe公司的PDF。",    
    "ja" : "このプレーヤーは、PDFのみのLivescribeによって作成をロードすることができます。Livescribe PDFファイルを選択してください。"
  }
};


window._i18n = function(srcTxt, lngg) {
  
  function detectLanguage() {
    return navigator.userLanguage || navigator.language || "en";
  }

  lngg = lngg || detectLanguage();
  
  if (!DCT[srcTxt]) return srcTxt; //Return phrase if phrase not found in dictionary
  
  return DCT[srcTxt][lngg] || DCT[srcTxt][lngg.substring(0,2)] || srcTxt;

}