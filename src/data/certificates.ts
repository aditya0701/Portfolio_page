/** A single completed Coursera course credential, with its public share link. */
export type Course = {
  title: string;
  /** Public Coursera "share" URL for the credential. */
  href: string;
  /** Completion date, as printed on the certificate. */
  date: string;
};

/** A credential group — a Coursera Specialization or Professional Certificate —
 *  and the courses within it that have been completed. `totalCourses` is the
 *  program's official course count, so `courses.length / totalCourses` reads as
 *  honest progress rather than implying the whole track is done. */
export type Credential = {
  id: string;
  program: string;
  provider: string;
  kind: "Specialization" | "Professional Certificate";
  /** Instance hue used for the accent rule on this credential's panel. */
  hue: "i1" | "i2" | "i3" | "i4" | "i5" | "i6";
  blurb: string;
  totalCourses: number;
  courses: Course[];
  /** Public share link to the *whole-program* completion certificate, present
   *  only when every course in the program has been finished. Its existence is
   *  what the page treats as "specialization complete". */
  certificateHref?: string;
  certificateDate?: string;
};

const share = (id: string) => `https://coursera.org/share/${id}`;

export const credentials: Credential[] = [
  {
    id: "deep-learning",
    program: "Deep Learning Specialization",
    provider: "DeepLearning.AI",
    kind: "Specialization",
    hue: "i3",
    blurb:
      "Andrew Ng's five-course sequence: dense nets and backprop from scratch, the practical tuning that makes them train, and the CNN and sequence-model architectures the rest of my computer-vision work is built on.",
    totalCourses: 5,
    courses: [
      { title: "Neural Networks and Deep Learning", href: share("7a5d79586369297633bf44860f8cc9bb"), date: "Feb 2023" },
      {
        title: "Improving Deep Neural Networks: Hyperparameter Tuning, Regularization and Optimization",
        href: share("fb5840c65c22578883cc4eddb114a2ad"),
        date: "Mar 2023",
      },
      { title: "Structuring Machine Learning Projects", href: share("6a7db85beeda58e9169010237fbdb86c"), date: "Mar 2023" },
      { title: "Convolutional Neural Networks", href: share("15ad775e4a47c7d8181cf03b7b7006c5"), date: "Mar 2023" },
      { title: "Sequence Models", href: share("c5ba00e2ae0a31156c2d96cbf8747a76"), date: "Mar 2023" },
    ],
    certificateHref: share("3796003aefb42641355afc2a9c3f007e"),
    certificateDate: "Mar 2023",
  },
  {
    id: "machine-learning",
    program: "Machine Learning Specialization",
    provider: "DeepLearning.AI · Stanford University",
    kind: "Specialization",
    hue: "i5",
    blurb:
      "The updated Ng/Stanford ML foundations — supervised regression and classification, the algorithms that sit under modern tooling, and unsupervised learning, recommenders and reinforcement learning.",
    totalCourses: 3,
    courses: [
      {
        title: "Supervised Machine Learning: Regression and Classification",
        href: share("f78b7d15efcac100ccf1b1be9fd427b3"),
        date: "Jul 2022",
      },
      { title: "Advanced Learning Algorithms", href: share("2bdf4e78af96103582047318e0749086"), date: "Jul 2022" },
      {
        title: "Unsupervised Learning, Recommenders, Reinforcement Learning",
        href: share("26e89351e749f6158f40e4facb42fe9f"),
        date: "Aug 2022",
      },
    ],
    certificateHref: share("b4f68f905f2d6c75ff2ffb3b70097cf6"),
    certificateDate: "Aug 2022",
  },
  {
    id: "applied-data-science",
    program: "Applied Data Science with Python",
    provider: "University of Michigan",
    kind: "Specialization",
    hue: "i4",
    blurb:
      "The Python data-science stack applied end to end — pandas and the scientific toolkit, publication-grade plotting and charting, and machine learning in scikit-learn.",
    totalCourses: 5,
    courses: [
      { title: "Introduction to Data Science in Python", href: share("efe90e99401772bb6bbe9fa74f69a236"), date: "Dec 2022" },
      {
        title: "Applied Plotting, Charting & Data Representation in Python",
        href: share("e4e157a7bce323c8d2095539129b4004"),
        date: "Jan 2023",
      },
      { title: "Applied Machine Learning in Python", href: share("25786de3e61dce2fb1cbe2f66272b110"), date: "Feb 2023" },
    ],
  },
  {
    id: "google-data-analytics",
    program: "Google Data Analytics Professional Certificate",
    provider: "Google",
    kind: "Professional Certificate",
    hue: "i2",
    blurb:
      "The full applied analytics workflow — asking the right question, preparing and cleaning data, analysing it and communicating the result through visualization, closed out with a hands-on capstone case study.",
    totalCourses: 8,
    courses: [
      { title: "Foundations: Data, Data, Everywhere", href: share("36a018bc0dee94f2fea989f0719310ae"), date: "Dec 2021" },
      {
        title: "Ask Questions to Make Data-Driven Decisions",
        href: share("3b1cab7258e2cf94b20236795ca18188"),
        date: "Dec 2021",
      },
      { title: "Prepare Data for Exploration", href: share("e1960c4deb29dbaf38939ea62de4a423"), date: "Jan 2022" },
      { title: "Process Data from Dirty to Clean", href: share("60ab65c76e80df23f1923a3b7cc24cff"), date: "Feb 2022" },
      { title: "Analyze Data to Answer Questions", href: share("d28fa69f1dda1ee16c26cd04a9b20984"), date: "Feb 2022" },
      {
        title: "Share Data Through the Art of Visualization",
        href: share("5ff43589f652159aa4c73197ff420f91"),
        date: "Feb 2022",
      },
      { title: "Data Analysis with R Programming", href: share("c13324b0a7fa21baaf1f910c42d32ab6"), date: "Feb 2022" },
      {
        title: "Google Data Analytics Capstone: Complete a Case Study",
        href: share("0422bba4844c005f96dff512c05d418a"),
        date: "Mar 2022",
      },
    ],
    certificateHref: share("e0765c291ad7c257f3f169b251a49975"),
    certificateDate: "Mar 2022",
  },
];

/** Total individual course certificates listed across all credentials. */
export const totalCourseCount = credentials.reduce((n, c) => n + c.courses.length, 0);

/** Number of programs finished end to end (a whole-program certificate exists). */
export const completedSpecializations = credentials.filter((c) => c.certificateHref).length;
