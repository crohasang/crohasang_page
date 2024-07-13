interface PageInfo {
  name: string;
  description: string;
}

const PageDescriptions: Record<string, PageInfo> = {
  '/introduce': { name: 'Introduce', description: '저를 소개합니다' },
  '/projects': {
    name: 'Projects',
    description: '진행했던, 진행 중인 프로젝트들',
  },
  '/preferences': {
    name: 'Preferences',
    description: '제가 좋아하는 것들',
  },
};

export default PageDescriptions;
