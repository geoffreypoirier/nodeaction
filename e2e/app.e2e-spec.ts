import { NodeactionPage } from './app.po';

describe('nodeaction App', () => {
  let page: NodeactionPage;

  beforeEach(() => {
    page = new NodeactionPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
