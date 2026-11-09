/**
 * Short, user-visible, evidence-bounded answers for the original V1.2 pages.
 * These are NOT FAQ rich-result promises or a ranking signal; ensure every
 * statement stays consistent with the actual available browser tool.
 */
export type GeoAnswer={question:string;answer:string;distinctions:string[];limitation:string;sources:{name:string;url:string}[]};
export const GEO_ANSWERS: Record<string,GeoAnswer> = {
  "/laptop-screen-dead-pixel-test": {
    "question": "How do I check a laptop screen for dead pixels?",
    "answer": "Open the color test on the laptop's built-in display and examine black, white, red, green and blue fields. A fixed dark point on white or a bright colored point on black is worth recording and comparing across colors; it is not an automatic diagnosis.",
    "distinctions": [
      "Compare the internal screen and an external display separately when possible.",
      "A full horizontal or vertical line needs different troubleshooting from a single dot.",
      "Record the model, color backgrounds and approximate location before checking the manufacturer's pixel policy."
    ],
    "limitation": "An external monitor comparison narrows the symptoms but cannot alone identify a failed panel, cable or graphics component.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/dead-pixel-fixer": {
    "question": "Can a website fix a dead or stuck pixel?",
    "answer": "A browser cannot repair a physically failed pixel. This tool shows a movable, manually controlled static color patch so you can compare a suspected stuck subpixel without rapid flashing, pressure or heat.",
    "distinctions": [
      "Use white and RGB backgrounds to see whether the spot remains visible.",
      "Treat a color change as an observation, not proof that the panel was repaired.",
      "Check the manufacturer's warranty or service procedure if a spot persists."
    ],
    "limitation": "There is no guaranteed software repair, and this page does not offer one.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/phone-screen-dead-pixel-test": {
    "question": "How can I test my iPhone or Android screen for dead pixels?",
    "answer": "Show static black, white, red, green and blue screens on the phone itself. Compare the same point across several backgrounds and check the glass, screen protector and camera cutout before assuming a panel defect.",
    "distinctions": [
      "Use the touch-friendly overlay if mobile Safari does not provide native fullscreen.",
      "Repeat under normal brightness, noting HDR and adaptive display settings.",
      "A digital screenshot generally records the rendered image, not defects in the physical display."
    ],
    "limitation": "The page helps you record possible defects; it cannot remotely certify phone-screen hardware.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/what-is-a-dead-pixel": {
    "question": "What is the difference between a dead pixel and a stuck pixel?",
    "answer": "A dead or dark pixel fails to produce the expected light and may look dark on white. A stuck or bright subpixel can stay visibly colored on black. Dust, reflections and protective-film marks can resemble either symptom.",
    "distinctions": [
      "A black field makes unexpected bright points easier to see.",
      "A white field makes unexpected dark points easier to notice.",
      "Red, green and blue fields help compare possible subpixel behavior."
    ],
    "limitation": "Visual checks do not identify the internal component or determine warranty eligibility.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/dead-pixel-line-test": {
    "question": "Is a vertical or horizontal screen line the same as a dead pixel?",
    "answer": "No. A continuous row or column of abnormal pixels is a different symptom from one isolated dark dot. Compare the line across solid colors, stripes and a second input or display where possible.",
    "distinctions": [
      "A line that appears across several backgrounds should be documented.",
      "A changed cable, input or display may help narrow the troubleshooting.",
      "Do not press the panel or assume the browser can repair a full line."
    ],
    "limitation": "Only further hardware diagnosis can identify whether the panel, cable, signal or graphics system is responsible.",
    "sources": []
  },
  "/image-retention-test": {
    "question": "How is temporary image retention different from OLED burn-in?",
    "answer": "Image retention appears as a faint outline left by earlier content and may fade. Permanent OLED burn-in involves lasting uneven aging. A brief neutral-gray visual check can document the appearance but cannot prove which process caused it.",
    "distinctions": [
      "Begin with a neutral gray background at comfortable brightness.",
      "Return to varied normal content and compare again later.",
      "Use the pixel-refresh or panel-care procedure for your specific model only as directed by its manufacturer."
    ],
    "limitation": "The website cannot reverse panel wear or guarantee that a retained outline will disappear.",
    "sources": [
      {
        "name": "Samsung — OLED image retention and burn-in care",
        "url": "https://www.samsung.com/sg/support/displays/how-to-troubleshoot-burnin-or-image-retention-on-your-samsung-oled-monitor/"
      }
    ]
  },
  "/screen-resolution-test": {
    "question": "Can a website detect my monitor's native resolution?",
    "answer": "A browser can show CSS screen and viewport dimensions and device pixel ratio (DPR). Those browser-reported figures are not a reliable substitute for the physical panel's native pixel specification.",
    "distinctions": [
      "Screen.width reports CSS pixels, not an assured physical panel count.",
      "DPR describes CSS-to-device pixel scaling and may change with browser zoom.",
      "For PPI, enter the manufacturer's native width, height and diagonal size yourself."
    ],
    "limitation": "This page cannot automatically verify physical pixel pitch, native panel resolution or calibrated DPI.",
    "sources": [
      {
        "name": "MDN — Screen.width (CSS pixels)",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Screen/width"
      },
      {
        "name": "MDN — Window.devicePixelRatio",
        "url": "https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio"
      }
    ]
  },
  "/screen-contrast-test": {
    "question": "Can an online screen contrast test measure my monitor's contrast ratio?",
    "answer": "No. This page displays grayscale steps, black/white fields and gradients so you can visually compare shadow detail, clipping and banding. A physical contrast ratio requires calibrated measurements of light output.",
    "distinctions": [
      "Use comfortable brightness and consistent room lighting.",
      "Look for visible separation near black and near white.",
      "Check HDR, color-profile and browser settings before assuming a hardware problem."
    ],
    "limitation": "The tool cannot report true luminance in nits, color-gamut coverage or a certified contrast ratio.",
    "sources": []
  },
  "/pt-br/": {
    "question": "Como testar pixels mortos online?",
    "answer": "Abra o teste nesta tela e compare fundos estáticos preto, branco, vermelho, verde e azul. Um ponto escuro no branco ou brilhante no preto merece uma segunda verificação em outras cores, mas não representa diagnóstico automático.",
    "distinctions": [
      "Limpe a tela e elimine reflexos antes de começar.",
      "Marque a posição aproximada e repita a observação em outras cores.",
      "Consulte a política de pixels do fabricante se a anomalia persistir."
    ],
    "limitation": "O navegador exibe padrões visuais; não identifica o componente defeituoso nem garante troca pela assistência.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/pt-br/pixel-morto-notebook/": {
    "question": "Como verificar um pixel morto na tela do notebook?",
    "answer": "Use fundos sólidos na tela integrada do notebook e procure pontos que se destacam no branco, preto e nas cores primárias. Compare a mesma região várias vezes antes de registrar um possível defeito.",
    "distinctions": [
      "Confirme que a janela do navegador está na tela do notebook.",
      "Compare um monitor externo separadamente, se houver.",
      "Anote se é apenas um ponto ou uma linha horizontal ou vertical inteira."
    ],
    "limitation": "A diferença entre telas ajuda na investigação, mas não identifica sozinha o painel ou cabo responsável.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/pt-br/pixel-morto-iphone/": {
    "question": "É possível testar pixel morto no iPhone pelo navegador?",
    "answer": "Sim. Compare fundos estáticos preto, branco, vermelho, verde e azul na própria tela do iPhone. O Safari pode usar uma sobreposição em vez do modo de tela cheia nativo.",
    "distinctions": [
      "Limpe o vidro e verifique a película ou o recorte da câmera.",
      "Observe o mesmo ponto em diferentes fundos com brilho confortável.",
      "Registre a posição aproximada em vez de depender de uma captura de tela."
    ],
    "limitation": "Capturas digitais não comprovam falhas que existem apenas no painel físico; a página não emite laudo.",
    "sources": []
  },
  "/pt-br/reparar-pixel-preso/": {
    "question": "Um pixel preso pode ser reparado online?",
    "answer": "Uma página não consegue reparar um pixel fisicamente danificado. Aqui você pode comparar cores estáticas em uma área móvel para observar um ponto que permanece vermelho, verde ou azul, sem flashes rápidos.",
    "distinctions": [
      "Confirme a posição do ponto com fundos preto, branco e RGB.",
      "Não aplique pressão, calor ou rotinas intensas de luz intermitente.",
      "Se o problema persistir, confira o procedimento e a garantia do fabricante."
    ],
    "limitation": "A ferramenta é apenas visual; não promete recuperação de pixels.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/pt-br/o-que-e-dead-pixel/": {
    "question": "O que é dead pixel e como diferenciar de pixel preso?",
    "answer": "Um dead pixel pode parecer um ponto escuro em um fundo claro; um pixel preso pode permanecer aceso em uma cor. Poeira, película e reflexos também podem se parecer com defeitos.",
    "distinctions": [
      "Observe pontos claros sobre preto.",
      "Observe pontos escuros sobre branco.",
      "Repita a comparação com vermelho, verde e azul."
    ],
    "limitation": "Uma inspeção visual não determina sozinha a causa interna nem os critérios de troca.",
    "sources": [
      {
        "name": "Dell — Display Pixel Guidelines",
        "url": "https://www.dell.com/support/kbdoc/en-us/000126004/dell-display-pixel-guidelines"
      }
    ]
  },
  "/pt-br/teste-de-cores/": {
    "question": "O teste de cores online mede a precisão do monitor?",
    "answer": "Não. Os fundos e gradientes permitem comparar visualmente tons, faixas abruptas e separação entre cinzas. Não medem brilho em nits, contraste físico nem cobertura sRGB.",
    "distinctions": [
      "Compare níveis próximos do preto e do branco.",
      "Observe gradientes suaves e possíveis faixas visíveis.",
      "Anote HDR, perfil de cores, luminosidade e condições do ambiente."
    ],
    "limitation": "Calibração profissional e medição de cor exigem equipamentos adequados.",
    "sources": []
  }
};
