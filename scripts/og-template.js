const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const BG_COLOR = '#f8f4ec';
const TEXT_COLOR = '#000000';
const BRAND = "JV's blog";
const FONT_FAMILY = 'Noto Serif';

function truncateTitle(title, maxLines = 3, maxCharsPerLine = 36) {
  const maxChars = maxLines * maxCharsPerLine;
  if (title.length <= maxChars) return title;

  const truncated = title.slice(0, maxChars - 1).trimEnd();
  const lastSpace = truncated.lastIndexOf(' ');
  const safe = lastSpace > maxChars * 0.6 ? truncated.slice(0, lastSpace) : truncated;
  return `${safe}…`;
}

function buildMainContent(title, subtitle) {
  const displayTitle = truncateTitle(title);

  if (!subtitle) {
    return {
      type: 'div',
      props: {
        style: {
          fontSize: 64,
          lineHeight: 1.25,
          textAlign: 'center',
          maxWidth: '100%',
        },
        children: displayTitle,
      },
    };
  }

  const displaySubtitle = truncateTitle(subtitle, 2, 42);

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        textAlign: 'center',
        maxWidth: '100%',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: 64,
              lineHeight: 1.25,
            },
            children: displayTitle,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 36,
              lineHeight: 1.3,
              opacity: 0.8,
            },
            children: displaySubtitle,
          },
        },
      ],
    },
  };
}

function buildOgTemplate({ title, subtitle = null, showFooter = true }) {
  const children = [
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        },
        children: buildMainContent(title, subtitle),
      },
    },
  ];

  if (showFooter) {
    children.push({
      type: 'div',
      props: {
        style: {
          fontSize: 32,
          lineHeight: 1.2,
          textAlign: 'center',
          opacity: 0.75,
          marginTop: 24,
        },
        children: BRAND,
      },
    });
  }

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: BG_COLOR,
        color: TEXT_COLOR,
        fontFamily: FONT_FAMILY,
        padding: '80px 96px',
      },
      children,
    },
  };
}

module.exports = {
  BG_COLOR,
  FONT_FAMILY,
  OG_HEIGHT,
  OG_WIDTH,
  buildOgTemplate,
};
