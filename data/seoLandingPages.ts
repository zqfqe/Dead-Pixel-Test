export type InspectionMode = 'pixels' | 'fixer' | 'lines' | 'retention' | 'resolution' | 'contrast' | 'guide';

export interface SeoLandingPage {
  path: string;
  lang: 'en' | 'pt-BR';
  indexable?: boolean; // Explicitly false until SERP and unique-value gates pass.
  title: string;
  description: string;
  h1: string;
  lead: string;
  mode: InspectionMode;
  intent: string;
  steps: string[];
  notes: string[];
  faq: { question: string; answer: string }[];
}

// Each page has a separate user task and real testing/diagnostic value.
// The source keyword list is the US+BR Semrush export reviewed in V1.2.
// Search volume/KD are research inputs; they are NOT published as product claims.
export const SEO_LANDING_PAGES: SeoLandingPage[] = [
  {
    path: '/laptop-screen-dead-pixel-test/', lang:'en',
    title:'Laptop Dead Pixel Test – Check Your Screen Online',
    description:'Inspect a laptop screen for dead, bright and stuck pixels using full-screen colors and a laptop-specific checklist. Free visual test.',
    h1:'Laptop Screen Dead Pixel Test', lead:'Check the built-in laptop display with solid colors, then compare suspect spots across several colors. This is a visual self-check, not an automatic hardware scan.',
    mode:'pixels', intent:'dead pixels on laptop screen',
    steps:['Clean the panel gently and remove reflections.','If using an external monitor, move this browser window onto the laptop screen before starting.','Inspect black, white, red, green and blue screens in sequence.','Mark a suspect spot and revisit it with another color.','If an entire line is affected, use the screen-line troubleshooting guide instead.'],
    notes:['An external monitor behaving normally does not by itself prove the laptop panel is faulty.','Avoid pressing, rubbing or heating the panel. Use the device warranty process for suspected defects.'],
    faq:[{question:'Can a website detect a dead laptop pixel automatically?',answer:'No. The browser draws test patterns; you visually identify and record a suspect location.'},{question:'What if I see a full line?',answer:'A continuous horizontal or vertical line can have several causes. Compare with an external display and follow the dedicated line test.'}]
  },
  {
    path:'/dead-pixel-fixer/',lang:'en',
    title:'Dead Pixel Fixer? Check Stuck Pixels Safely',
    description:'Inspect a suspected stuck pixel using a movable static color patch and a safe retest workflow. No dangerous rapid flashing or repair guarantee.',
    h1:'Stuck Pixel Check & Safe Retest',lead:'A stuck pixel may stay red, green or blue. A truly damaged pixel cannot be repaired by a webpage. Use the movable static patch to compare the area without rapid flashing.',
    mode:'fixer',intent:'laptop dead pixel repair',
    steps:['Confirm the spot persists after cleaning the screen.','Move the static test patch close to the suspicious area.','Manually switch among static test colors.','Retest after normal device troubleshooting; contact the seller if the problem remains.'],
    notes:['This is not a physical pixel repair or a warranty diagnosis.','Do not press the display, apply heat or run high-frequency flashing patterns.'],
    faq:[{question:'Can software fix a dead pixel?',answer:'Software cannot repair a physically failed pixel. Some temporary color anomalies may change, but no result is guaranteed.'},{question:'Why no flashing repair mode?',answer:'Rapid light changes may cause photosensitivity problems and are unnecessary for a basic visual diagnosis.'}]
  },
  {
    path:'/phone-screen-dead-pixel-test/',lang:'en',
    title:'Phone Screen Dead Pixel Test – iPhone & Android',
    description:'Check iPhone and Android screens for dead and stuck pixels with touch-friendly full-screen colors and visual follow-up steps.',
    h1:'Phone Screen Dead Pixel Test',lead:'Use touch-friendly static colors to check a phone or tablet. Fullscreen APIs differ by mobile browser, so the test also works as an edge-to-edge overlay.',
    mode:'pixels',intent:'phone screen test',
    steps:['Clean the glass and check for dust under the protector.','Use portrait and landscape orientation where relevant.','View black, white and primary color screens one at a time.','Tap to record suspicious positions for manual follow-up.'],
    notes:['Some mobile browsers cannot enter native fullscreen; the overlay remains usable.','A screenshot will not reliably capture physical pixel defects in the display panel.'],
    faq:[{question:'Does this work on iPhone?',answer:'Yes, although native fullscreen support varies. The color overlay provides a fallback.'},{question:'Can I use a screenshot as evidence?',answer:'A normal digital screenshot usually cannot show faults that exist only in the physical screen panel.'}]
  },
  {
    path:'/what-is-a-dead-pixel/',lang:'en',
    title:'What Is a Dead Pixel? Dead vs Stuck vs Bright',
    description:'Understand dead, stuck and bright pixels; distinguish dust and image retention; use a free multi-color self-check.',
    h1:'What Is a Dead Pixel?',lead:'A dead pixel fails to display its expected light. A stuck subpixel may remain colored, while dirt on the glass can look similar. Test with several static backgrounds before drawing conclusions.',
    mode:'guide',intent:'what is a dead pixel',
    steps:['Clean the panel and remove visible dust.','Observe the spot on white and black backgrounds.','Repeat with red, green and blue.','If it changes with the background, distinguish a stuck subpixel, a surface mark or a temporary artifact.'],
    notes:['Different panel technologies can produce different-looking defects.','Warranty coverage depends on manufacturer and product policy; the website cannot determine eligibility.'],
    faq:[{question:'Are dead and stuck pixels identical?',answer:'No. A dead pixel does not produce the intended output; a stuck subpixel can remain in a particular color.'},{question:'Is dust always a dead pixel?',answer:'No. Clean the glass and inspect the same spot on multiple backgrounds first.'}]
  },
  {
    path:'/dead-pixel-line-test/',lang:'en',
    title:'Dead Pixel Line Test – Vertical & Horizontal Screen Lines',
    description:'Check a horizontal or vertical screen line with solid colors and grid patterns. Separate line symptoms from individual dead pixels.',
    h1:'Screen Line & Dead Pixel Line Test',lead:'A whole row or column of abnormal pixels is not the same as one isolated dead pixel. Compare static color fields and line patterns to document the symptom.',
    mode:'lines',intent:'dead line of pixels',
    steps:['Inspect the same screen area using white, black and gray backgrounds.','Switch to horizontal, vertical and grid patterns to trace the line.','If possible, compare an external display and another input source.','Do not infer the failed hardware component from a single web test.'],
    notes:['A line can be caused by multiple hardware or signal issues.','Avoid pressing the panel or disassembling the screen.'],
    faq:[{question:'Can a browser fix a vertical line?',answer:'No. It can help you document the symptom, not repair a panel or signal connection.'},{question:'Is a row of dead pixels the same as one dead pixel?',answer:'No. A continuous row or column warrants broader troubleshooting.'}]
  },
  {
    path:'/image-retention-test/',lang:'en',
    title:'Image Retention Test – Check Screen Persistence',
    description:'Use static gray, white, black and checkerboard patterns to inspect temporary image retention and possible burn-in.',
    h1:'Image Retention & Screen Persistence Test',lead:'Image retention is a residual image visible after the content changes. Use neutral static backgrounds to observe whether any previous image remains visible.',
    mode:'retention',intent:'lcd image persistence',
    steps:['Display a neutral gray background.','Check for outlines of previously displayed static content.','Compare white and dark gray patterns.','Allow normal use or follow the manufacturer guidance and recheck later.'],
    notes:['A browser cannot calculate a reliable burn-in percentage or determine panel health automatically.','Temporary image persistence and permanent OLED burn-in are not the same diagnosis.'],
    faq:[{question:'Can the test measure permanent burn-in?',answer:'No. It shows patterns for manual observation; it cannot quantify panel degradation.'},{question:'Should I run an intense flashing routine?',answer:'No. Use static patterns and follow the display manufacturer guidance.'}]
  },
  {
    path:'/screen-resolution-test/',lang:'en',
    title:'Screen Resolution Test – CSS Pixels & DPR',
    description:'See screen and viewport CSS pixel sizes, device pixel ratio and available screen dimensions. Learn the limits of browser resolution detection.',
    h1:'Browser Screen Resolution Checker',lead:'Read the dimensions your browser exposes, including CSS screen size, viewport and device pixel ratio. These are not guaranteed to equal the panel’s native physical resolution.',
    mode:'resolution',intent:'display resolution test',
    steps:['Open this page on the display you want to inspect.','Compare screen and browser viewport CSS pixel dimensions.','Check browser zoom and operating-system scaling.','For native panel resolution, consult your operating-system display settings or device specifications.'],
    notes:['CSS pixel sizes and DPR change with display scaling and browser zoom.','Browser JavaScript cannot consistently verify the native hardware resolution.'],
    faq:[{question:'Is screen.width the native pixel resolution?',answer:'Not necessarily. The Screen API reports CSS pixel dimensions.'},{question:'Does DPR mean DPI?',answer:'No. DPR is a scaling ratio between device and CSS pixels, not a physical dots-per-inch measurement.'}]
  },
  {
    path:'/screen-contrast-test/',lang:'en',
    title:'Screen Contrast Test – Grayscale & Color Gradients',
    description:'Use grayscale ramps, black/white fields and color bands to visually inspect a monitor’s contrast and banding.',
    h1:'Screen Contrast & Grayscale Test',lead:'Examine dark and light shade separation with static patterns. This is an observational test, not a photometer-based measurement of contrast ratio or brightness in nits.',
    mode:'contrast',intent:'screen contrast test',
    steps:['Choose a neutral room lighting condition.','Display a gray ramp and look for distinct steps near black and white.','Inspect smooth gradients for obvious banding.','Recheck with HDR and adaptive brightness settings noted.'],
    notes:['A web pattern cannot measure display luminance in nits or the actual panel contrast ratio.','Color profiles, HDR, viewing angle and browser behavior influence appearance.'],
    faq:[{question:'Can this measure a 1000:1 contrast ratio?',answer:'No. That requires physical light measurements.'},{question:'What is color banding?',answer:'Banding is a visibly abrupt transition where a smoother gradient is expected.'}]
  },
  {
    path:'/pt-br/',lang:'pt-BR',
    title:'Teste de Pixel Morto Online – Monitor e Tela',
    description:'Faça um teste de pixel morto grátis com cores em tela cheia. Confira pontos pretos, brilhantes e pixels presos no monitor ou notebook.',
    h1:'Teste de Pixel Morto',lead:'Verifique pontos pretos, claros ou coloridos usando fundos estáticos. O resultado depende da observação visual; o site não detecta defeitos físicos automaticamente.',
    mode:'pixels',intent:'teste de dead pixel',
    steps:['Limpe a tela e reduza reflexos.','Comece o teste com as cores preta e branca.','Continue com vermelho, verde e azul.','Marque os locais suspeitos e confira em outras cores.'],
    notes:['Não aperte a tela nem use calor para tentar corrigir pontos.','Um registro feito pelo usuário não substitui laudo técnico ou garantia.'],
    faq:[{question:'O teste detecta pixel morto sozinho?',answer:'Não. O navegador exibe cores e você observa a tela.'},{question:'O que é pixel preso?',answer:'É um subpixel que permanece aceso ou travado em determinada cor.'}]
  },
  {
    path:'/pt-br/pixel-morto-notebook/',lang:'pt-BR',
    title:'Pixel Morto no Notebook – Teste de Tela Gratuito',
    description:'Confira pixel morto no notebook com cores em tela cheia e um passo a passo para diferenciar defeitos isolados e linhas na tela.',
    h1:'Pixel Morto no Notebook',lead:'Teste a tela integrada do notebook e compare pontos suspeitos em várias cores. Um pixel defeituoso é diferente de uma faixa inteira na tela.',
    mode:'pixels',intent:'pixel morto notebook',
    steps:['Limpe a tela e evite reflexos fortes.','Abra o teste na própria tela do notebook.','Observe branco, preto, vermelho, verde e azul.','Anote os pontos suspeitos e compare com um monitor externo quando possível.'],
    notes:['Não desmonte nem pressione o painel.','Antes de solicitar assistência, confira a política de garantia do fabricante.'],
    faq:[{question:'Posso testar a tela do notebook online?',answer:'Sim. As cores em tela cheia permitem uma inspeção visual.'},{question:'Uma linha na tela é pixel morto?',answer:'Uma linha contínua pode ter causas diferentes de um pixel isolado.'}]
  },
  {
    path:'/pt-br/pixel-morto-iphone/',lang:'pt-BR',
    title:'Pixel Morto no iPhone – Teste de Tela Online',
    description:'Teste pixel morto no iPhone com cores estáticas, controle por toque e instruções para identificar manchas e pontos suspeitos.',
    h1:'Pixel Morto no iPhone',lead:'Confira a tela do iPhone com fundos de cores sólidas, sem baixar aplicativo. No Safari, o teste pode usar uma sobreposição em vez de tela cheia nativa.',
    mode:'pixels',intent:'pixel morto iphone',
    steps:['Limpe o vidro e observe se há marcas na película.','Abra o teste e use as cores preta e branca.','Confira também vermelho, verde e azul.','Registre e revise os pontos suspeitos em cada cor.'],
    notes:['Uma captura de tela digital não mostra necessariamente um defeito físico no painel.','Não pressione ou aqueça a tela para tentar reparar pixels.'],
    faq:[{question:'Funciona no Safari do iPhone?',answer:'Sim, com modo de sobreposição quando a API de tela cheia não estiver disponível.'},{question:'Um ponto preto é sempre pixel morto?',answer:'Não. Poeira, película e outros defeitos podem parecer semelhantes.'}]
  },
  {
    path:'/pt-br/reparar-pixel-preso/',lang:'pt-BR',
    title:'Pixel Preso – Verificar e Tentar Identificar com Segurança',
    description:'Entenda a diferença entre pixel morto e pixel preso. Use uma área estática de cores para conferir um ponto sem flashes rápidos.',
    h1:'Pixel Preso: Verificação Segura',lead:'Um pixel preso pode permanecer em uma cor específica. A página oferece comparação com cores estáticas, sem prometer conserto físico.',
    mode:'fixer',intent:'pixel preso',
    steps:['Limpe a tela e localize o ponto suspeito.','Mova a área de cor estática até a região.','Troque as cores manualmente.','Registre o resultado e procure assistência quando necessário.'],
    notes:['Software não conserta pixels fisicamente danificados.','Evite flashes rápidos, pressão ou calor na tela.'],
    faq:[{question:'Dá para consertar pixel morto online?',answer:'Não há garantia. Um pixel fisicamente danificado não é reparado por uma página web.'},{question:'Por que o teste não pisca rápido?',answer:'A verificação estática evita expor visitantes a flashes intensos desnecessários.'}]
  },
  {
    path:'/pt-br/o-que-e-dead-pixel/',lang:'pt-BR',
    title:'O Que É Dead Pixel? Pixel Morto, Preso e Queimado',
    description:'Entenda o que é dead pixel, diferenças entre pixel morto, preso e ponto brilhante, além de como fazer uma inspeção visual.',
    h1:'O Que É Dead Pixel?',lead:'Dead pixel é um defeito em que o pixel não apresenta a saída esperada. Um pixel preso ou uma mancha de poeira pode parecer similar à primeira vista.',
    mode:'guide',intent:'o que é dead pixel',
    steps:['Limpe a superfície do monitor ou celular.','Observe o ponto no fundo branco e preto.','Compare vermelho, verde e azul.','Anote o comportamento e consulte a garantia do equipamento.'],
    notes:['Pixel queimado e burn-in não são sinônimos de um único ponto morto.','Não existe certificado automático de defeito físico neste site.'],
    faq:[{question:'Dead pixel e pixel preso são iguais?',answer:'Não. Um pixel preso pode permanecer em determinada cor; um pixel morto não exibe o resultado esperado.'},{question:'Pixel queimado é sempre burn-in?',answer:'Não. A expressão popular pode se referir a diferentes problemas da tela.'}]
  },
  {
    path:'/pt-br/teste-de-cores/',lang:'pt-BR',
    title:'Teste de Cores do Monitor – Gradiente e Contraste',
    description:'Faça um teste de cores, brilho visual e contraste com gradientes, preto, branco e níveis de cinza. Gratuito, direto no navegador.',
    h1:'Teste de Cores e Contraste',lead:'Compare cores, gradações e detalhes perto do preto e branco. O navegador exibe padrões visuais, mas não mede brilho em nits ou cobertura de espaço de cor.',
    mode:'contrast',intent:'teste de cores',
    steps:['Ajuste o ambiente para reduzir reflexos.','Use preto e branco para observar áreas extremas.','Abra gradientes e observe se existem faixas abruptas.','Anote se HDR ou brilho automático estavam ativos.'],
    notes:['Não é uma medição colorimétrica profissional.','Não fornece percentual real de sRGB, DCI-P3 ou contraste físico.'],
    faq:[{question:'Posso testar cores do monitor online?',answer:'Sim. Os padrões permitem avaliação visual de cores e gradações.'},{question:'A página mede brilho em nits?',answer:'Não. Isso requer instrumentos de medição.'}]
  }
];

export const SEO_PAGE_BY_PATH: Record<string, SeoLandingPage> =
  Object.fromEntries(SEO_LANDING_PAGES.map(page => [page.path.replace(/\/$/, '') || '/', page]));

export const LOCALE_PAIRS: Array<[string,string]> = [
  ['/', '/pt-br/'],
  ['/laptop-screen-dead-pixel-test/', '/pt-br/pixel-morto-notebook/'],
  ['/dead-pixel-fixer/', '/pt-br/reparar-pixel-preso/'],
  ['/what-is-a-dead-pixel/', '/pt-br/o-que-e-dead-pixel/']
];

export function pageAlternates(path: string): { lang: string; path: string }[] {
  const pair=LOCALE_PAIRS.find(([a,b])=>a===path||b===path);
  if(!pair)return [];
  const byPath=new Map(SEO_LANDING_PAGES.map(page=>[page.path.replace(/\/$/,'')||'/',page]));
  const en=byPath.get(pair[0].replace(/\/$/,'')||'/');
  const pt=byPath.get(pair[1].replace(/\/$/,'')||'/');
  if(!en?.indexable||!pt?.indexable)return [];
  return [{lang:'en',path:pair[0]},{lang:'pt-BR',path:pair[1]}];
}
