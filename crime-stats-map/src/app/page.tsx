
import { PageContainer } from "./components/PageContainer";
import { TitleBar } from "./components/Titlebar";
import { PostcodeInput } from "./components/PostcodeInput";

export default function Home() {
  return (
    <PageContainer>
      <TitleBar title="Crime Stats Map"/>
      <PostcodeInput />
    </PageContainer>
);
}
