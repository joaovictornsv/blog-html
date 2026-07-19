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

function buildOgTemplate({ brand, title, description = null }) {
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
        paddingBottom: brand ? BRAND_TOP : 0,
      },
      children: centeredContent,
    },
  };

  const children = brand
    ? [
        {
          type: 'div',
          props: {
            style: {
              paddingTop: BRAND_TOP,
              fontSize: 30,
              lineHeight: 1.2,
              opacity: 0.85,
              width: CONTENT_WIDTH,
            },
            children: brand,
          },
        },
        centeredBlock,
      ]
    : [centeredBlock];

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
