export const profile = {
  name: "Aditya Rawat",
  role: "ML Systems · Computer Vision · LLM Engineering",
  location: "Aachen, Germany",
  email: "aditya.rawat@rwth-aachen.de",
  github: "https://github.com/aditya0701",
  huggingface: "https://huggingface.co/aditya0701",
  summary:
    "M.Sc. Data Science candidate at RWTH Aachen. Two tracks, one habit: measure the thing, then decide. I fine-tune and benchmark 3D segmentation models on custom confocal microscopy data and ship the tools that put them in front of the biologists who need them. I also build LLM systems that run unattended in production, where grounding is enforced in code rather than requested in a prompt.",
};

export const education = [
  {
    period: "10/2023 – 09/2026 (expected)",
    title: "M.Sc. Data Science",
    place: "RWTH Aachen University",
    detail:
      "Focus: Computer Vision, Data Science, Machine Learning. Grades — Machine Learning: 1.7, Business Process Intelligence: 1.7, Advanced Process Mining: 1.7, Intro to Data Science: 2.1.",
  },
  {
    period: "09/2017 – 05/2021",
    title: "B.Sc. Computer Engineering",
    place: "University of Mumbai",
    detail: "Final grade 8.42/10. Focus: Software Development, Software Engineering, Machine Learning.",
  },
];

export const experience = [
  {
    period: "11/2025 – 09/2026",
    title: "Master's Thesis — Computer Vision Research",
    place: "Software Engineering Group, RWTH Aachen University",
    detail:
      "Building a fully reproducible deep-learning pipeline to segment and quantify synaptic markers in confocal microscopy of the Drosophila mushroom body calyx — fine-tuning MicroSAM and benchmarking it against Cellpose 3D, nnU-Net v2, and SwinUNETR. Supervised by Prof. Dr. Abigail Morrison, with Prof. Dr.-Ing. Johannes Stegmaier as second examiner.",
  },
  {
    period: "07/2024 – 05/2025",
    title: "Student Assistant — Computer Vision Research",
    place: "Institut für Industrieofenbau und Wärmetechnik, Aachen",
    detail:
      "Researched monocular metrology methods for measuring hot heel depth in an Electric Arc Furnace. Built Python/OpenCV tools for industrial computer vision applications and supported PhD candidates with data collection and analysis.",
  },
  {
    period: "06/2021 – 03/2023",
    title: "Quality Engineer",
    place: "Larsen & Toubro Infotech, Hyderabad",
    detail:
      "Delivered an automated testing framework (Python + Selenium) from proof-of-concept to production, improving testing efficiency by 50%. API testing with Postman; trained junior engineers on testing methodology.",
  },
  {
    period: "06/2020 – 07/2020",
    title: "Intern",
    place: "Ramrao Adik Institute of Technology, Navi Mumbai",
    detail:
      "Managed a team of 5 building a mobile test-taking app in Flutter/Firebase, including GPS-based authentication and UI design end to end.",
  },
];

export const skills = {
  "Languages": ["Python", "TypeScript", "Java", "C++"],
  "Computer Vision": [
    "PyTorch",
    "MicroSAM / SAM",
    "nnU-Net v2",
    "SwinUNETR",
    "Cellpose 3D",
    "MONAI",
    "YOLO",
    "OpenCV",
    "napari",
    "3D instance segmentation",
  ],
  "LLM & Agents": [
    "Agentic tool use",
    "LLM pipeline design",
    "Grounding & hallucination mitigation",
    "Prompt / token-budget engineering",
    "sentence-transformers",
    "Chainlit",
    "Vision-language models",
    "Evals",
  ],
  "ML & Data": ["Transformers", "Foundation models", "Scikit-learn", "Pandas", "Matplotlib", "Seaborn"],
  "Infra & Tools": ["Git", "Docker", "GitHub Actions", "FastAPI", "Hugging Face", "Postman", "Celonis"],
};
