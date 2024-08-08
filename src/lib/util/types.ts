export type BlogPost = {
  title:      string,
  slug:       string,
  tags:       string[],
  keywords:   string[],
  excerpt:    string,

  hidden:     boolean,
  date:       string,
  updated?:   string,
  related:    BlogPost[],
  html?:      string,
};
