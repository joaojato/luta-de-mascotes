/** Safari/Chrome mudam a area visivel depois de girar e ao esconder as barras. */
export function acompanharViewport():void {
  let quadro=0;
  const medir=()=>{
    cancelAnimationFrame(quadro);
    quadro=requestAnimationFrame(()=>{
      const viewport=window.visualViewport;
      document.documentElement.style.setProperty('--altura-visivel',`${viewport?.height ?? window.innerHeight}px`);
      document.documentElement.style.setProperty('--largura-visivel',`${viewport?.width ?? window.innerWidth}px`);
    });
  };
  window.addEventListener('resize',medir);
  window.addEventListener('orientationchange',medir);
  window.addEventListener('pageshow',medir);
  window.visualViewport?.addEventListener('resize',medir);
  medir();
}
