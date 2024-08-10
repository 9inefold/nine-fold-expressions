export type BlogPost = {
  title:      string,
  slug:       string,
  tags:       string[],
  keywords:   string[],
  excerpt:    string,
  component:  string | false,

  hidden:     boolean,
  date:       string,
  updated?:   string,
  image?:     string,
  related:    BlogPost[],
  html?:      string,
};
