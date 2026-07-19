const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const BG_COLOR = '#f8f4ec';
const TEXT_COLOR = '#000000';
const FONT_FAMILY = 'Noto Serif';
const PADDING_X = 80;
const BRAND_TOP = 56;
const CONTENT_WIDTH = OG_WIDTH - PADDING_X * 2;
const BG_GRADIENT = 'linear-gradient(145deg, #faf6ee 0%, #f3ebdc 45%, #ebe1cf 100%)';
const TITLE_GRADIENT = 'linear-gradient(180deg, #141414 0%, #2f2a24 55%, #4a4035 100%)';
const TITLE_FONT_SIZES = [88, 76, 68, 60, 54];
const DESCRIPTION_FONT_RATIO = 34 / 88;
const TITLE_MAX_LINES = 3;
const AVG_CHAR_WIDTH_RATIO = 0.52;
const CTA_BG = '#2f2a24';
const CTA_COLOR = BG_COLOR;
const CTA_FONT_SIZE = 24;

function avgCharWidth(fontSize) {
  return fontSize * AVG_CHAR_WIDTH_RATIO;
}

function charsPerLine(fontSize, width = CONTENT_WIDTH) {
  return Math.max(10, Math.floor(width / avgCharWidth(fontSize)));
}

function estimateTitleLines(text, fontSize, width = CONTENT_WIDTH) {
  const maxChars = charsPerLine(fontSize, width);
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;

  let lines = 1;
  let currentLen = 0;

  for (const word of words) {
    const nextLen = currentLen === 0 ? word.length : currentLen + 1 + word.length;
    if (nextLen > maxChars) {
      lines += 1;
      currentLen = word.length;
      if (word.length > maxChars) {
        lines += Math.floor(word.length / maxChars);
        currentLen = word.length % maxChars;
      }
    } else {
      currentLen = nextLen;
    }
  }

  return lines;
}

function getTypography(title) {
  for (const titleFontSize of TITLE_FONT_SIZES) {
    if (estimateTitleLines(title, titleFontSize) <= TITLE_MAX_LINES) {
      return {
        titleFontSize,
        descriptionFontSize: Math.round(titleFontSize * DESCRIPTION_FONT_RATIO),
      };
    }
  }

  const titleFontSize = TITLE_FONT_SIZES[TITLE_FONT_SIZES.length - 1];
  return {
    titleFontSize,
    descriptionFontSize: Math.round(titleFontSize * DESCRIPTION_FONT_RATIO),
  };
}

function titleTextStyle(fontSize) {
  return {
    display: 'flex',
    flexDirection: 'column',
    fontSize,
    lineHeight: 1.35,
    width: CONTENT_WIDTH,
    paddingBottom: 18,
    backgroundImage: TITLE_GRADIENT,
    backgroundClip: 'text',
    color: 'transparent',
  };
}

function truncateText(text, maxLines, maxCharsPerLine) {
  const maxChars = maxLines * maxCharsPerLine;
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars - 1).trimEnd();
  const lastSpace = truncated.lastIndexOf(' ');
  const safe = lastSpace > maxChars * 0.6 ? truncated.slice(0, lastSpace) : truncated;
  return `${safe}…`;
}

const CTA_ARROW_HEIGHT = 16;
const CTA_ARROW_WIDTH = 9;
const CTA_ARROW_VIEWBOX = '222 125 230 391';
const CTA_ARROW_PATH = 'M439.1 297.4C451.6 309.9 451.6 330.2 439.1 342.7L279.1 502.7C266.6 515.2 246.3 515.2 233.8 502.7C221.3 490.2 221.3 469.9 233.8 457.4L371.2 320L233.9 182.6C221.4 170.1 221.4 149.8 233.9 137.3C246.4 124.8 266.7 124.8 279.2 137.3L439.2 297.3z';

function buildCtaArrow() {
  return {
    type: 'svg',
    props: {
      viewBox: CTA_ARROW_VIEWBOX,
      width: CTA_ARROW_WIDTH,
      height: CTA_ARROW_HEIGHT,
      style: {
        display: 'flex',
        flexShrink: 0,
      },
      children: {
        type: 'path',
        props: {
          d: CTA_ARROW_PATH,
          fill: CTA_COLOR,
        },
      },
    },
  };
}

function buildCtaButton() {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backgroundColor: CTA_BG,
        color: CTA_COLOR,
        fontSize: CTA_FONT_SIZE,
        lineHeight: 1,
        padding: '12px 24px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      },
      children: [
        {
          type: 'span',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              height: CTA_FONT_SIZE,
            },
            children: 'Read more',
          },
        },
        buildCtaArrow(),
      ],
    },
  };
}

function buildHeaderRow(brand, showCta) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: showCta ? 'space-between' : 'flex-start',
        alignItems: 'center',
        width: '100%',
        paddingTop: BRAND_TOP,
      },
      children: [
        brand
          ? {
              type: 'div',
              props: {
                style: {
                  fontSize: 30,
                  lineHeight: 1.2,
                  opacity: 0.85,
                },
                children: brand,
              },
            }
          : {
              type: 'div',
              props: {
                style: { width: 1 },
                children: '',
              },
            },
        ...(showCta ? [buildCtaButton()] : []),
      ],
    },
  };
}

function buildOgTemplate({ brand, title, description = null, ctaPlacement = 'header' }) {
  const { titleFontSize, descriptionFontSize } = getTypography(title);
  const displayTitle = truncateText(title, TITLE_MAX_LINES, charsPerLine(titleFontSize));
  const displayDescription = description ? truncateText(description, 2, 52) : null;

  const centeredContent = [
    {
      type: 'div',
      props: {
        style: {
          ...titleTextStyle(titleFontSize),
          marginBottom: displayDescription ? 24 : 0,
        },
        children: displayTitle,
      },
    },
  ];

  if (displayDescription) {
    centeredContent.push({
      type: 'div',
      props: {
        style: {
          fontSize: descriptionFontSize,
          lineHeight: 1.4,
          opacity: 0.4,
          width: CONTENT_WIDTH,
        },
        children: displayDescription,
      },
    });
  }

  if (ctaPlacement === 'content') {
    const ctaButton = buildCtaButton();
    ctaButton.props.style = {
      ...ctaButton.props.style,
      marginTop: displayDescription ? 32 : 24,
    };
    centeredContent.push(ctaButton);
  }

  const showHeaderCta = ctaPlacement === 'header';
  const showHeader = Boolean(brand) || showHeaderCta;

  const centeredBlock = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: CONTENT_WIDTH,
        paddingBottom: showHeader ? BRAND_TOP : 0,
      },
      children: centeredContent,
    },
  };

  const children = [];
  if (showHeader) {
    children.push(buildHeaderRow(brand, showHeaderCta));
  }
  children.push(centeredBlock);

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        backgroundColor: BG_COLOR,
        backgroundImage: BG_GRADIENT,
        color: TEXT_COLOR,
        fontFamily: FONT_FAMILY,
        padding: `0 ${PADDING_X}px`,
        boxSizing: 'border-box',
      },
      children,
    },
  };
}

module.exports = {
  BG_COLOR,
  CONTENT_WIDTH,
  FONT_FAMILY,
  OG_HEIGHT,
  OG_WIDTH,
  buildOgTemplate,
  estimateTitleLines,
  getTypography,
};
