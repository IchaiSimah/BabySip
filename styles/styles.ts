/**
 * Unified Styles - All application styles in a single file
 * 
 * This file contains all styles used in the application,
 * organized by category for easy maintenance.
 * 
 * Structure:
 * - Global styles (containers, buttons, text)
 * - Component-specific styles
 * - Utility styles
 */

import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { theme } from './theme';

// Type utility to ensure correct types
type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

// === GLOBAL STYLES ===
const globalStylesDefinition = {
  // === CONTAINERS ===
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  scrollView: {
    flex: 1,
  } as ViewStyle,
  
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  loadingText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.medium,
  } as TextStyle,
  
  // === HEADERS ===
  header: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingVertical: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    ...theme.shadows.sm,
  } as ViewStyle,
  
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  } as TextStyle,
  
  appTitle: {
    fontSize: 50,
    fontFamily: 'ChoplinBold',
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
    letterSpacing: 1.0,
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: theme.colors.primary.main,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  } as TextStyle,
  
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.fontWeight.normal,
  } as TextStyle,
  
  // === SECTIONS ===
  section: {
    paddingHorizontal: theme.layout.screenPadding,
    paddingVertical: theme.spacing.md,
  } as ViewStyle,
  
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  
  // === CARDS ===
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.layout.cardPadding,
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  // === BUTTONS ===
  button: {
    height: theme.layout.buttonHeight,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  } as ViewStyle,
  
  primaryButton: {
    backgroundColor: theme.colors.primary.main,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  secondaryButton: {
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  buttonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  secondaryButtonText: {
    color: theme.colors.text.primary,
  } as TextStyle,
  
  // === INPUTS ===
  input: {
    height: theme.layout.inputHeight,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  
  inputFocused: {
    borderColor: theme.colors.primary.main,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  // === LISTS ===
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  } as ViewStyle,
  
  listItemText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  listItemSubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  
  // === BADGES ===
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  } as ViewStyle,
  
  badgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  // === DIVIDERS ===
  divider: {
    height: 1,
    backgroundColor: theme.colors.neutral[200],
    marginVertical: theme.spacing.md,
  } as ViewStyle,
  
  // === STATUS INDICATORS ===
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.xs,
  } as ViewStyle,
  
  statusSuccess: {
    backgroundColor: theme.colors.status.success,
  } as ViewStyle,
  
  statusWarning: {
    backgroundColor: theme.colors.status.warning,
  } as ViewStyle,
  
  statusError: {
    backgroundColor: theme.colors.status.error,
  } as ViewStyle,
  
  // === EMPTY STATE ===
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  } as ViewStyle,
  
  emptyStateText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  } as TextStyle,
  
  // === RESPONSIVE DESIGN ===
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  spaceBetween: {
    justifyContent: 'space-between',
  } as ViewStyle,
  
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  // === TEXT STYLES ===
  textXs: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  textSm: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  textMd: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  textLg: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  textXl: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  textBold: {
    fontWeight: theme.fontWeight.bold,
  } as TextStyle,
  
  textSemibold: {
    fontWeight: theme.fontWeight.semibold,
  } as TextStyle,
  
  textMedium: {
    fontWeight: theme.fontWeight.medium,
  } as TextStyle,
  
  // === TEXT COLORS ===
  textPrimary: {
    color: theme.colors.text.primary,
  } as TextStyle,
  
  textSecondary: {
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  textTertiary: {
    color: theme.colors.text.tertiary,
  } as TextStyle,
  
  textMuted: {
    color: theme.colors.text.muted,
  } as TextStyle,
  
  textInverse: {
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  // === BACKGROUND COLORS ===
  bgPrimary: {
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  bgSecondary: {
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  
  bgTertiary: {
    backgroundColor: theme.colors.background.tertiary,
  } as ViewStyle,
  
  // === SPACING UTILITIES ===
  pXs: { padding: theme.spacing.xs } as ViewStyle,
  pSm: { padding: theme.spacing.sm } as ViewStyle,
  pMd: { padding: theme.spacing.md } as ViewStyle,
  pLg: { padding: theme.spacing.lg } as ViewStyle,
  pXl: { padding: theme.spacing.xl } as ViewStyle,
  
  pxXs: { paddingHorizontal: theme.spacing.xs } as ViewStyle,
  pxSm: { paddingHorizontal: theme.spacing.sm } as ViewStyle,
  pxMd: { paddingHorizontal: theme.spacing.md } as ViewStyle,
  pxLg: { paddingHorizontal: theme.spacing.lg } as ViewStyle,
  pxXl: { paddingHorizontal: theme.spacing.xl } as ViewStyle,
  
  pyXs: { paddingVertical: theme.spacing.xs } as ViewStyle,
  pySm: { paddingVertical: theme.spacing.sm } as ViewStyle,
  pyMd: { paddingVertical: theme.spacing.md } as ViewStyle,
  pyLg: { paddingVertical: theme.spacing.lg } as ViewStyle,
  pyXl: { paddingVertical: theme.spacing.xl } as ViewStyle,
  
  mXs: { margin: theme.spacing.xs } as ViewStyle,
  mSm: { margin: theme.spacing.sm } as ViewStyle,
  mMd: { margin: theme.spacing.md } as ViewStyle,
  mLg: { margin: theme.spacing.lg } as ViewStyle,
  mXl: { margin: theme.spacing.xl } as ViewStyle,
  
  mxXs: { marginHorizontal: theme.spacing.xs } as ViewStyle,
  mxSm: { marginHorizontal: theme.spacing.sm } as ViewStyle,
  mxMd: { marginHorizontal: theme.spacing.md } as ViewStyle,
  mxLg: { marginHorizontal: theme.spacing.lg } as ViewStyle,
  mxXl: { marginHorizontal: theme.spacing.xl } as ViewStyle,
  
  myXs: { marginVertical: theme.spacing.xs } as ViewStyle,
  mySm: { marginVertical: theme.spacing.sm } as ViewStyle,
  myMd: { marginVertical: theme.spacing.md } as ViewStyle,
  myLg: { marginVertical: theme.spacing.lg } as ViewStyle,
  myXl: { marginVertical: theme.spacing.xl } as ViewStyle,
  
  mtXs: { marginTop: theme.spacing.xs } as ViewStyle,
  mtSm: { marginTop: theme.spacing.sm } as ViewStyle,
  mtMd: { marginTop: theme.spacing.md } as ViewStyle,
  mtLg: { marginTop: theme.spacing.lg } as ViewStyle,
  mtXl: { marginTop: theme.spacing.xl } as ViewStyle,
  
  mbXs: { marginBottom: theme.spacing.xs } as ViewStyle,
  mbSm: { marginBottom: theme.spacing.sm } as ViewStyle,
  mbMd: { marginBottom: theme.spacing.md } as ViewStyle,
  mbLg: { marginBottom: theme.spacing.lg } as ViewStyle,
  mbXl: { marginBottom: theme.spacing.xl } as ViewStyle,
  
  mlXs: { marginLeft: theme.spacing.xs } as ViewStyle,
  mlSm: { marginLeft: theme.spacing.sm } as ViewStyle,
  mlMd: { marginLeft: theme.spacing.md } as ViewStyle,
  mlLg: { marginLeft: theme.spacing.lg } as ViewStyle,
  mlXl: { marginLeft: theme.spacing.xl } as ViewStyle,
  
  mrXs: { marginRight: theme.spacing.xs } as ViewStyle,
  mrSm: { marginRight: theme.spacing.sm } as ViewStyle,
  mrMd: { marginRight: theme.spacing.md } as ViewStyle,
  mrLg: { marginRight: theme.spacing.lg } as ViewStyle,
  mrXl: { marginRight: theme.spacing.xl } as ViewStyle,
  
  // === BORDER UTILITIES ===
  roundedXs: { borderRadius: theme.borderRadius.xs } as ViewStyle,
  roundedSm: { borderRadius: theme.borderRadius.sm } as ViewStyle,
  roundedMd: { borderRadius: theme.borderRadius.md } as ViewStyle,
  roundedLg: { borderRadius: theme.borderRadius.lg } as ViewStyle,
  roundedXl: { borderRadius: theme.borderRadius.xl } as ViewStyle,
  roundedFull: { borderRadius: theme.borderRadius.full } as ViewStyle,
  
  // === FLEX UTILITIES ===
  flex1: { flex: 1 } as ViewStyle,
  flexRow: { flexDirection: 'row' } as ViewStyle,
  flexCol: { flexDirection: 'column' } as ViewStyle,
  itemsCenter: { alignItems: 'center' } as ViewStyle,
  itemsStart: { alignItems: 'flex-start' } as ViewStyle,
  itemsEnd: { alignItems: 'flex-end' } as ViewStyle,
  justifyCenter: { justifyContent: 'center' } as ViewStyle,
  justifyStart: { justifyContent: 'flex-start' } as ViewStyle,
  justifyEnd: { justifyContent: 'flex-end' } as ViewStyle,
  justifyBetween: { justifyContent: 'space-between' } as ViewStyle,
  justifyAround: { justifyContent: 'space-around' } as ViewStyle,
  
  // === POSITION UTILITIES ===
  absolute: { position: 'absolute' } as ViewStyle,
  relative: { position: 'relative' } as ViewStyle,
  
  // === OVERFLOW UTILITIES ===
  overflowHidden: { overflow: 'hidden' } as ViewStyle,
  overflowScroll: { overflow: 'scroll' } as ViewStyle,
  
  // === Z-INDEX UTILITIES ===
  z0: { zIndex: 0 } as ViewStyle,
  z10: { zIndex: 10 } as ViewStyle,
  z20: { zIndex: 20 } as ViewStyle,
  z30: { zIndex: 30 } as ViewStyle,
  z40: { zIndex: 40 } as ViewStyle,
  z50: { zIndex: 50 } as ViewStyle,
  
  // === WIDTH/HEIGHT UTILITIES ===
  wFull: { width: '100%' } as ViewStyle,
  hFull: { height: '100%' } as ViewStyle,
  
  // === OPACITY UTILITIES ===
  opacity0: { opacity: 0 } as ViewStyle,
  opacity25: { opacity: 0.25 } as ViewStyle,
  opacity50: { opacity: 0.5 } as ViewStyle,
  opacity75: { opacity: 0.75 } as ViewStyle,
  opacity100: { opacity: 1 } as ViewStyle,
};

// === COMPONENT-SPECIFIC STYLES ===
const componentStylesDefinition = {
  // === SWIPEABLE ITEM ===
  // Styles for swipeable list items with edit/delete actions
  swipeableContainer: {
    position: 'relative',
    marginVertical: 2,
    overflow: 'hidden',
  } as ViewStyle,
  
  swipeableBackgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: theme.spacing.md,
    backgroundColor: 'transparent',
  } as ViewStyle,
  
  swipeableButtonContainer: {
    flexDirection: 'row',
    gap: 8,
  } as ViewStyle,
  
  swipeableActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    minWidth: 48,
    minHeight: 48,
  } as ViewStyle,
  
  swipeableContentContainer: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  } as ViewStyle,
  
  // === STATISTICS SCREEN ===
  // Styles for the statistics dashboard with charts and data tables
  statisticsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  statisticsLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,
  
  statisticsLoadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  statisticsHeader: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  } as ViewStyle,
  
  statisticsTitle: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  
  statisticsSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  statisticsPeriodSelector: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  } as ViewStyle,
  
  statisticsPeriodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  } as ViewStyle,
  
  statisticsPeriodButtonActive: {
    backgroundColor: theme.colors.primary.main,
  } as ViewStyle,
  
  statisticsPeriodButtonText: {
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  statisticsPeriodButtonTextActive: {
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  statisticsChartContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  statisticsChartTitle: {
    fontSize: 18,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,
  
  statisticsChart: {
    height: 200,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  } as ViewStyle,
  
  statisticsSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  
  statisticsSummaryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  statisticsSummaryValue: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  
  statisticsSummaryLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  } as TextStyle,

  statisticsTableContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.md,
  } as ViewStyle,

  statisticsTableTitle: {
    fontSize: 18,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  } as TextStyle,

  statisticsTableHeader: {
    flexDirection: 'row',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  } as ViewStyle,

  statisticsTableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  } as TextStyle,

  statisticsTableRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  } as ViewStyle,

  statisticsTableCell: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.secondary,
  } as TextStyle,

  statisticsErrorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  } as ViewStyle,

  statisticsErrorText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  } as TextStyle,

  statisticsRetryButton: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
  } as ViewStyle,

  statisticsRetryButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: theme.fontWeight.medium,
  } as TextStyle,

  statisticsChartWrapper: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  } as ViewStyle,
  
  // === LANGUAGE SELECTOR MODAL ===
  // Styles for the language selection modal with flag icons
  languageSelectorOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,
  
  languageSelectorModalContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34, // Safe area for iPhone
    ...theme.shadows.lg,
  } as ViewStyle,
  
  languageSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  languageSelectorHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  languageSelectorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
  } as TextStyle,
  
  languageSelectorCloseButton: {
    padding: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.neutral[100],
  } as ViewStyle,
  
  languageSelectorLanguagesContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  } as ViewStyle,
  
  languageSelectorLanguageOption: {
    borderRadius: 16,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[50],
    borderWidth: 2,
    borderColor: 'transparent',
  } as ViewStyle,
  
  languageSelectorSelectedLanguageOption: {
    backgroundColor: theme.colors.primary.light + '20',
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  
  languageSelectorLanguageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  } as ViewStyle,
  
  languageSelectorFlag: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  } as TextStyle,
  
  languageSelectorLanguageInfo: {
    flex: 1,
  } as ViewStyle,
  
  languageSelectorLanguageName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  } as TextStyle,
  
  languageSelectorSelectedLanguageName: {
    color: theme.colors.primary.main,
  } as TextStyle,
  
  languageSelectorLanguageCode: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  } as TextStyle,
  
  languageSelectorSelectedLanguageCode: {
    color: theme.colors.primary.dark,
  } as TextStyle,
  
  languageSelectorCheckContainer: {
    marginLeft: theme.spacing.sm,
  } as ViewStyle,
  
  languageSelectorFooter: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  languageSelectorFooterText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,
  
  // === ADD BOTTLE SCREEN ===
  // Styles for the bottle input screen with amount and time selection
  addBottleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  
  addBottleBackButton: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  
  addBottleTitleContainer: {
    flex: 1,
  } as ViewStyle,
  
  addBottleAmountDisplay: {
    backgroundColor: theme.colors.text.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  } as ViewStyle,
  
  addBottleAmountDisplayText: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  addBottleAmountDisplayLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  
  addBottleSuggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  
  addBottleSuggestionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  addBottleSuggestionButtonSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.light,
  } as ViewStyle,
  
  addBottleSuggestionText: {
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  addBottleSuggestionTextSelected: {
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  addBottleTimeDisplay: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  } as ViewStyle,
  
  addBottleTimeDisplayText: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  addBottleTimeDisplayLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  
  addBottleColorPickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  } as ViewStyle,
  
  addBottleColorOption: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  addBottleColorOptionSelected: {
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  
  addBottleColorPreview: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  } as ViewStyle,
  
  addBottleColorPreviewSelected: {
    borderColor: theme.colors.text.inverse,
  } as ViewStyle,
  
  addBottleSelectedColorDisplay: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  } as ViewStyle,
  
  addBottleSelectedColorDisplayText: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  addBottleSelectedColorDisplayLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  
  addBottleActionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  } as ViewStyle,
  
  addBottleCustomAmountModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  addBottleCustomAmountContent: {
    backgroundColor: '#fff',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
    width: '80%',
    alignItems: 'center',
  } as ViewStyle,
  
  addBottleCustomAmountTitle: {
    fontSize: 18,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 15,
  } as TextStyle,
  
  addBottleCustomAmountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: theme.borderRadius.xs,
    padding: theme.spacing.sm,
    fontSize: 16,
    width: '100%',
    marginBottom: 20,
  } as ViewStyle,
  
  addBottleCustomAmountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  } as ViewStyle,
  
  addBottleCustomAmountButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xs,
    minWidth: 80,
    alignItems: 'center',
  } as ViewStyle,
  
  addBottleCustomAmountButtonText: {
    fontSize: 16,
    color: '#666',
  } as TextStyle,
  
  // === MODAL STYLES ===
  // Base modal styles used across all modal components
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  } as ViewStyle,
  
  modalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...theme.shadows.lg,
  } as ViewStyle,
  
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  modalTitle: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    flex: 1,
  } as TextStyle,
  
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  modalBody: {
    flex: 1,
  } as ViewStyle,
  
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  modalActionButton: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  } as ViewStyle,
  
  modalPrimaryActionButton: {
    backgroundColor: theme.colors.primary.main,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  modalSecondaryActionButton: {
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  modalSecondaryActionButtonText: {
    color: theme.colors.text.primary,
  } as TextStyle,
  
  modalFormGroup: {
    marginBottom: theme.spacing.lg,
  } as ViewStyle,
  
  modalFormLabel: {
    fontSize: 16,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  
  modalFormInput: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  } as ViewStyle,
  
  modalFormInputFocused: {
    borderColor: theme.colors.primary.main,
    ...theme.shadows.sm,
  } as ViewStyle,
  
  modalSuggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  } as ViewStyle,
  
  modalSuggestionButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  } as ViewStyle,
  
  modalSuggestionButtonSelected: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  } as ViewStyle,
  
  modalSuggestionText: {
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  modalSuggestionTextSelected: {
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  modalSectionHeaderIcon: {
    width: 24,
    height: 24,
    marginRight: theme.spacing.sm,
  } as ViewStyle,
  
  modalSectionHeaderText: {
    fontSize: 18,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  modalTimeDisplay: {
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  } as ViewStyle,
  
  modalTimeDisplayText: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  } as TextStyle,
  
  modalTimeDisplayLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  
  modalAmountDisplay: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
  } as ViewStyle,
  
  modalAmountDisplayText: {
    fontSize: 24,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  } as TextStyle,
  
  modalAmountDisplayLabel: {
    fontSize: 12,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  } as TextStyle,
  
  modalCustomAmountContainer: {
    marginTop: theme.spacing.md,
  } as ViewStyle,
  
  modalCustomAmountInput: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    textAlign: 'center',
  } as ViewStyle,
  
  modalInfoInput: {
    height: 80,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
    textAlignVertical: 'top',
  } as TextStyle,
  
  modalLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.xl,
  } as ViewStyle,
  
  modalErrorContainer: {
    backgroundColor: theme.colors.status.error,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  modalErrorText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  } as TextStyle,
  
  modalSuccessContainer: {
    backgroundColor: theme.colors.status.success,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  
  modalSuccessText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: theme.fontWeight.medium,
    textAlign: 'center',
  } as TextStyle,

  // === EDIT BOTTLE MODAL SPECIFIC STYLES ===
  // Styles for the edit bottle modal with form inputs and color picker
  editBottleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  } as ViewStyle,

  editBottleModalContainer: {
    width: '80%',
    height: '70%',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  } as ViewStyle,

  editBottleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,

  editBottleHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  } as TextStyle,

  editBottleCloseButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  editBottleCloseButtonText: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  } as TextStyle,

  editBottleContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  } as ViewStyle,

  editBottleSection: {
    marginBottom: 32,
  } as ViewStyle,

  editBottleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 16,
  } as TextStyle,

  editBottleAmountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  editBottleAmountInput: {
    flex: 1,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    fontSize: 16,
    color: theme.colors.text.primary,
  } as TextStyle,

  editBottleAmountUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.tertiary,
    minWidth: 30,
  } as TextStyle,

  editBottleTimeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
    alignItems: 'center',
  } as ViewStyle,

  editBottleTimeButtonText: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text.primary,
  } as TextStyle,

  editBottleColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  } as ViewStyle,

  editBottleColorSwatch: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.neutral[200],
  } as ViewStyle,

  editBottleColorSwatchSelected: {
    borderColor: theme.colors.primary.main,
    borderWidth: 3,
  } as ViewStyle,

  editBottleActions: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,

  editBottleButton: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  } as ViewStyle,

  editBottlePrimaryButton: {
    backgroundColor: theme.colors.primary.main,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  editBottleSecondaryButton: {
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 1,
    borderColor: theme.colors.neutral[200],
  } as ViewStyle,

  editBottleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  } as TextStyle,

  editBottleSecondaryButtonText: {
    color: theme.colors.text.primary,
  } as TextStyle,

  // === COLOR PICKER MODAL SPECIFIC STYLES ===
  // Styles for the color picker modal with wheel picker component
  colorPickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  colorPickerModalContent: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    flexDirection: 'column',
  } as ViewStyle,

  colorPickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  colorPickerModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  } as TextStyle,

  colorPickerModalCloseButton: {
    padding: theme.spacing.sm,
  } as ViewStyle,

  colorPickerModalPickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    height: 300,
    justifyContent: 'center',
  } as ViewStyle,

  colorPickerModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 16,
    height: 50,
  } as ViewStyle,

  colorPickerModalCancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.text.secondary,
  } as ViewStyle,

  colorPickerModalCancelButtonText: {
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  } as TextStyle,

  colorPickerModalConfirmButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary.main,
    alignItems: 'center',
    elevation: 2,
    shadowColor: theme.colors.primary.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  } as ViewStyle,

  colorPickerModalConfirmButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  } as TextStyle,

  // === ADD BOTTLE SCREEN SPECIFIC STYLES ===
  // Additional styles for the add bottle screen custom amount modal
  addBottleCustomAmountModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  addBottleCustomAmountModalContent: {
    backgroundColor: '#fff',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.sm,
    width: '80%',
    alignItems: 'center',
  } as ViewStyle,

  addBottleCustomAmountModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  } as TextStyle,

  addBottleCustomAmountModalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: theme.borderRadius.xs,
    padding: theme.spacing.sm,
    fontSize: 16,
    width: '100%',
    marginBottom: 20,
  } as TextStyle,

  addBottleCustomAmountModalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: theme.spacing.lg,
  } as ViewStyle,

  addBottleCustomAmountModalButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xs,
    minWidth: 100,
    alignItems: 'center',
  } as ViewStyle,

  addBottleCustomAmountModalButtonText: {
    fontSize: 16,
    color: '#666',
  } as TextStyle,

  addBottleCustomAmountModalConfirmButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xs,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: theme.colors.status.info,
  } as ViewStyle,

  addBottleCustomAmountModalConfirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  } as TextStyle,

  // === ADD POOP SCREEN SPECIFIC STYLES ===
  // Styles for the add poop screen time display
  addPoopTimeDisplayLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: 4,
  } as TextStyle,

  // === SETTINGS SCREEN SPECIFIC STYLES ===
  // Styles for the settings screen with language selection and controls
  settingsBackButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  } as ViewStyle,

  settingsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,

  settingsSectionIcon: {
    marginRight: 8,
    marginTop: 2,
  } as TextStyle,

  settingsLanguageDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 16,
    lineHeight: 20,
  } as TextStyle,

  settingsLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 2,
    borderColor: theme.colors.primary.main,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  settingsLanguageButtonText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  } as TextStyle,

  settingsLanguageButtonSubtext: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  } as TextStyle,

  settingsSettingContainer: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 16,
  } as ViewStyle,

  settingsSettingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  settingsSettingInfo: {
    flex: 1,
  } as ViewStyle,

  settingsSettingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  settingsSettingDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  } as TextStyle,

  settingsControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  settingsControlButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  settingsControlButtonLeft: {
    marginRight: 8,
  } as ViewStyle,

  settingsControlButtonRight: {
    marginLeft: 8,
  } as ViewStyle,

  settingsControlValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary.main,
    minWidth: 30,
    textAlign: 'center',
  } as TextStyle,

  settingsControlValueSecondary: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary.main,
    minWidth: 40,
    textAlign: 'center',
  } as TextStyle,

  settingsDebugInfo: {
    marginBottom: 16,
  } as ViewStyle,

  settingsDebugText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  } as TextStyle,

  settingsDebugValue: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  } as TextStyle,

  settingsLogoutButton: {
    backgroundColor: theme.colors.status.error,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  } as ViewStyle,

  settingsLogoutButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,

  // === DASHBOARD SCREEN SPECIFIC STYLES ===
  // Styles for the main dashboard with statistics and quick actions
  dashboardContainer: {
    flex: 1,
  } as ViewStyle,

  dashboardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  dashboardLogoContainer: {
    marginRight: 16,
  } as ViewStyle,

  dashboardLoadingSpinner: {
    marginLeft: 8,
  } as ViewStyle,

  dashboardTitleContainer: {
    flex: 1,
  } as ViewStyle,

  dashboardStatsButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  dashboardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 0,
  } as ViewStyle,

  dashboardSectionIcon: {
    marginRight: 8,
    marginTop: 4,
  } as TextStyle,

  dashboardStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  } as ViewStyle,

  dashboardStatItem: {
    alignItems: 'center',
  } as ViewStyle,

  dashboardStatValue: {
    fontSize: 24,
    fontWeight: '700',
  } as TextStyle,

  dashboardStatValuePrimary: {
    color: theme.colors.primary.dark,
  } as TextStyle,

  dashboardStatValueSecondary: {
    color: theme.colors.secondary.main,
  } as TextStyle,

  dashboardStatValueWarm: {
    color: theme.colors.status.warning,
  } as TextStyle,

  dashboardStatValueError: {
    color: theme.colors.status.error,
  } as TextStyle,

  dashboardStatLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  } as TextStyle,

  dashboardQuickActions: {
    flexDirection: 'row',
    gap: 16,
  } as ViewStyle,

  dashboardQuickActionButton: {
    flex: 1,
  } as ViewStyle,

  dashboardQuickActionIcon: {
    marginRight: 8,
  } as TextStyle,

  dashboardListItem: {
    flex: 1,
  } as ViewStyle,

  dashboardListItemIndicator: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.xs,
  } as ViewStyle,

  // === NOT FOUND SCREEN SPECIFIC STYLES ===
  // Styles for the 404/not found error screen
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,

  notFoundTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 20,
  } as TextStyle,

  notFoundLink: {
    marginTop: 15,
    paddingVertical: theme.spacing.sm,
  } as ViewStyle,

  notFoundLinkText: {
    fontSize: 16,
    color: theme.colors.primary.main,
    fontWeight: '600',
    textAlign: 'center',
  } as TextStyle,

  // === LOGIN SCREEN SPECIFIC STYLES ===
  // Styles for the login screen with form inputs and authentication
  loginContainer: {
    flex: 1,
  } as ViewStyle,

  loginScrollView: {
    flexGrow: 1,
  } as ViewStyle,

  loginHeader: {
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  loginLogoContainer: {
    marginBottom: 8,
  } as ViewStyle,

  loginTitleContainer: {
    marginBottom: 16,
  } as TextStyle,

  loginFormField: {
    marginBottom: 16,
  } as ViewStyle,

  loginFormFieldLarge: {
    marginBottom: 24,
  } as ViewStyle,

  loginFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  loginFormInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  } as TextStyle,

  loginPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,

  loginPasswordInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  } as TextStyle,

  loginPasswordToggle: {
    padding: theme.spacing.md,
  } as ViewStyle,

  loginButton: {
    marginBottom: 16,
  } as ViewStyle,

  loginButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  loginLinkContainer: {
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  loginLinkContainerLast: {
    alignItems: 'center',
  } as ViewStyle,

  loginLinkText: {
    fontSize: 16,
    color: theme.colors.primary.main,
    textDecorationLine: 'underline',
  } as TextStyle,

  // === REGISTER SCREEN SPECIFIC STYLES ===
  // Styles for the user registration screen with form validation
  registerContainer: {
    flex: 1,
  } as ViewStyle,

  registerScrollView: {
    flexGrow: 1,
  } as ViewStyle,

  registerHeader: {
    alignItems: 'center',
    marginBottom: 32,
  } as ViewStyle,

  registerLogoContainer: {
    marginBottom: 16,
  } as ViewStyle,

  registerFormField: {
    marginBottom: 16,
  } as ViewStyle,

  registerFormFieldLarge: {
    marginBottom: 24,
  } as ViewStyle,

  registerFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  registerFormInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  } as TextStyle,

  registerPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,

  registerPasswordInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  } as TextStyle,

  registerPasswordToggle: {
    padding: theme.spacing.md,
  } as ViewStyle,

  registerButton: {
    marginBottom: 16,
  } as ViewStyle,

  registerButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  registerLinkContainer: {
    alignItems: 'center',
  } as ViewStyle,

  registerLinkText: {
    fontSize: 16,
    color: theme.colors.primary.main,
    textDecorationLine: 'underline',
  } as TextStyle,

  registerTermsText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  } as TextStyle,

  // === FORGOT PASSWORD SCREEN SPECIFIC STYLES ===
  // Styles for the forgot password screen with email input
  forgotPasswordContainer: {
    flex: 1,
  } as ViewStyle,

  forgotPasswordScrollView: {
    flexGrow: 1,
  } as ViewStyle,

  forgotPasswordHeader: {
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  forgotPasswordLogoContainer: {
    marginBottom: 8,
  } as ViewStyle,

  forgotPasswordTitleContainer: {
    marginBottom: 16,
  } as TextStyle,

  forgotPasswordDescriptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  } as TextStyle,

  forgotPasswordFormField: {
    marginBottom: 24,
  } as ViewStyle,

  forgotPasswordFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  forgotPasswordFormInput: {
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  } as TextStyle,

  forgotPasswordButton: {
    marginBottom: 16,
  } as ViewStyle,

  forgotPasswordButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  forgotPasswordLinkContainer: {
    alignItems: 'center',
  } as ViewStyle,

  forgotPasswordLinkText: {
    fontSize: 16,
    color: theme.colors.primary.main,
    textDecorationLine: 'underline',
  } as TextStyle,

  forgotPasswordInfoText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  } as TextStyle,

  // === RESET PASSWORD SCREEN SPECIFIC STYLES ===
  // Styles for the reset password screen with password requirements
  resetPasswordContainer: {
    flex: 1,
  } as ViewStyle,

  resetPasswordScrollView: {
    flexGrow: 1,
  } as ViewStyle,

  resetPasswordHeader: {
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  resetPasswordLogoContainer: {
    marginBottom: 8,
  } as ViewStyle,

  resetPasswordDescriptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  } as TextStyle,

  resetPasswordFormField: {
    marginBottom: 16,
  } as ViewStyle,

  resetPasswordFormFieldLarge: {
    marginBottom: 24,
  } as ViewStyle,

  resetPasswordFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  resetPasswordPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.primary,
  } as ViewStyle,

  resetPasswordPasswordInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.primary,
  } as TextStyle,

  resetPasswordPasswordToggle: {
    padding: theme.spacing.md,
  } as ViewStyle,

  resetPasswordRequirementsContainer: {
    backgroundColor: theme.colors.background.tertiary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: 24,
  } as ViewStyle,

  resetPasswordRequirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  } as TextStyle,

  resetPasswordRequirementsText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    lineHeight: 16,
  } as TextStyle,

  resetPasswordButton: {
    marginBottom: 16,
  } as ViewStyle,

  resetPasswordButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  resetPasswordLinkContainer: {
    alignItems: 'center',
  } as ViewStyle,

  resetPasswordLinkText: {
    fontSize: 16,
    color: theme.colors.primary.main,
    textDecorationLine: 'underline',
  } as TextStyle,

  resetPasswordSecurityText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  } as TextStyle,

  // === VERIFY CODE SCREEN SPECIFIC STYLES ===
  // Styles for the email verification screen with code input
  verifyCodeContainer: {
    flex: 1,
  } as ViewStyle,

  verifyCodeScrollView: {
    flexGrow: 1,
  } as ViewStyle,

  verifyCodeHeader: {
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  verifyCodeLogoContainer: {
    marginBottom: 8,
  } as ViewStyle,

  verifyCodeDescriptionText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  } as TextStyle,

  verifyCodeEmailText: {
    fontSize: 14,
    color: theme.colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,

  verifyCodeInputContainer: {
    marginBottom: 24,
  } as ViewStyle,

  verifyCodeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  } as ViewStyle,

  verifyCodeInput: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: theme.colors.text.secondary,
    borderRadius: theme.borderRadius.sm,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
  } as TextStyle,

  verifyCodeInputFilled: {
    borderColor: theme.colors.primary.main,
  } as TextStyle,

  verifyCodeTimerText: {
    fontSize: 14,
    color: theme.colors.status.warning,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  } as TextStyle,

  verifyCodeButton: {
    marginBottom: 16,
  } as ViewStyle,

  verifyCodeButtonDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  verifyCodeResendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  verifyCodeResendContainerDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  verifyCodeResendText: {
    fontSize: 16,
    color: theme.colors.primary.main,
    textDecorationLine: 'underline',
  } as TextStyle,

  verifyCodeResendTextDisabled: {
    color: theme.colors.text.secondary,
  } as TextStyle,

  verifyCodeLinkContainer: {
    alignItems: 'center',
  } as ViewStyle,

  verifyCodeLinkText: {
    fontSize: 16,
    color: theme.colors.primary.main,
    textDecorationLine: 'underline',
  } as TextStyle,

  verifyCodeHelpText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  } as TextStyle,

  // === PROTECTED ROUTE SPECIFIC STYLES ===
  // Styles for the protected route loading screen
  protectedRouteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  protectedRouteLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  } as TextStyle,
};

// === EXPORT UNIFIED STYLES ===
export const styles = StyleSheet.create({
  ...globalStylesDefinition,
  ...componentStylesDefinition,
});

// === EXPORT THEME FOR COMPATIBILITY ===
export { theme };
export const colors = theme.colors;
export const spacing = theme.spacing;
export const borderRadius = theme.borderRadius;
export const fontSize = theme.fontSize;
export const fontWeight = theme.fontWeight;
export const shadows = theme.shadows;
export const layout = theme.layout;
