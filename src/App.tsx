import { AppProvider } from './context/AppProvider';
import { useAppState } from './hooks/useAppState';
import { AppContainer } from './ui/containers/AppContainer';
import { Header } from './ui/containers/Header';
import { Footer } from './ui/containers/Footer';
import { MainContent } from './ui/containers/MainContent';
import { WizardNav } from './ui/navs/WizardNav';
import { BracketPage } from './ui/pages/BracketPage';
import { IntroPage } from './ui/pages/IntroPage';
import { LeaderboardPage } from './ui/pages/LeaderboardPage';
import { PostSubmitModal } from './ui/panels/PostSubmitModal';
import { SubmissionConfirmModal } from './ui/panels/SubmissionConfirmModal';
import { Toast } from './ui/panels/Toast';

function Shell() {
  const { state } = useAppState();
  const { activePage, overlay } = state;
  const onIntro = activePage === 'intro';
  const onBracket = activePage === 'bracket';
  const footer = onIntro ? null : onBracket ? <WizardNav /> : <Footer />;

  let page: React.ReactNode;
  if (onIntro) page = <IntroPage />;
  else if (onBracket) page = <BracketPage />;
  else page = <LeaderboardPage />;

  return (
    <AppContainer header={<Header />} footer={footer}>
      <MainContent>{page}</MainContent>
      {overlay === 'submit-confirm' && <SubmissionConfirmModal />}
      {overlay === 'post-submit' && <PostSubmitModal />}
      <Toast />
    </AppContainer>
  );
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default App;
