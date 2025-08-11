
/**
 * Calcula la luminancia relativa de un color hexadecimal.
 */
function getLuminance(hex) {

    const rgb = parseInt(hex.substring(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
  
    const sRGB = [r, g, b].map(val => {
      const s = val / 255.0;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
  
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }
  
  /**
   * Calcula la relación de contraste entre dos colores hexadecimales.
   * Devuelve un objeto con la relación y un nivel de calificación ('Poor', 'Good', 'Excellent').
   */
  export function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
  
    const ratio = lum1 > lum2 
      ? (lum1 + 0.05) / (lum2 + 0.05) 
      : (lum2 + 0.05) / (lum1 + 0.05);
  
    let level = 'Poor';

    if (ratio >= 7) {
      level = 'Excellent'; // WCAG AAA
    } else if (ratio >= 4.5) {
      level = 'Good'; // WCAG AA
    }
  
    return {
      ratio: ratio.toFixed(2),
      level: level,
    };
  }