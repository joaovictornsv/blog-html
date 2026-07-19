const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const BG_COLOR = '#f8f4ec';
const TEXT_COLOR = '#000000';
const FONT_FAMILY = 'Noto Serif';
const PADDING_X = 80;
const BRAND_TOP = 56;
const CONTENT_WIDTH = OG_WIDTH - PADDING_X * 2;

function truncateText(text, maxLines, maxCharsPerLine) {
  const maxChars = maxLines * maxCharsPerLine;
  if (text.length <= maxChars) return text;

  const truncated = text.slice(0, maxChars - 1).trimEnd();
  const lastSpace = truncated.lastIndexOf(' ');
  const safe = lastSpace > maxChars * 0.6 ? truncated.slice(0, lastSpace) : truncated;
  return `${safe}…`;
}

function buildOgTemplate({ brand, title, description = null }) {
  const displayTitle = truncateText(title, 3, 26);
  const displayDescription = description ? truncateText(description, 2, 52) : null;

  const centeredContent = [
    {
      type: 'div',
      props: {
        style: {
          fontSize: 72,
          lineHeight: 1.12,
          marginBottom: displayDescription ? 24 : 0,
          width: CONTENT_WIDTH,
          opacity: 1,
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
          fontSize: 36,
          lineHeight: 1.35,
          opacity: 0.55,
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
};
