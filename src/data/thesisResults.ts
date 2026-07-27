// Numbers here are transcribed verbatim from the published model card:
// https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation
//
// The evaluation prioritises RECALL, matched-instance mIoU, and recall-weighted
// panoptic quality (RWPQ / PQ_rec), because a missed bouton is a permanent
// counting error while a false positive can be filtered downstream. That is why
// there is no Dice column: the card does not report per-pixel Dice, and inventing
// one would defeat the point of the metric guard.
//
// Figures are the matched two-image test set (combined 33 ground-truth boutons),
// one representative condition per model: the deconvolved All-PSF condition for
// the neural backbones, and each baseline's card condition.

export type ModelRow = {
  name: string;
  variant?: string;
  selected?: boolean;
  recall?: string;
  miou?: string;
  rwpq?: string;
  fp?: string;
  role?: string; // for baselines with no per-model figures on the card
};

export const thesisResults: ModelRow[] = [
  {
    name: "MicroSAM Large",
    variant: "vit_l_lm · All-PSF",
    selected: true,
    recall: "1.000",
    miou: "0.787",
    rwpq: "0.787",
    fp: "16",
  },
  {
    name: "MicroSAM Base",
    variant: "vit_b_lm · All-PSF",
    recall: "1.000",
    miou: "0.771",
    rwpq: "0.771",
    fp: "6",
  },
  {
    name: "CellposeSAM",
    variant: "2D XYZ · All-DoG",
    recall: "0.947",
    miou: "0.768",
    rwpq: "0.726",
    fp: "3",
  },
  {
    name: "Swin UNETR",
    variant: "All-PSF",
    recall: "0.947",
    miou: "0.732",
    rwpq: "0.693",
    fp: "1",
  },
  {
    name: "nnU-Net",
    variant: "All-PSF",
    recall: "0.895",
    miou: "0.678",
    rwpq: "0.609",
    fp: "2",
  },
  {
    name: "Imaris",
    variant: "semi-manual · current lab tool",
    recall: "0.735",
    miou: "0.505",
    rwpq: "0.371",
    fp: "5",
  },
];

export const thesisResultsMeta = {
  testSet: "matched two-image test set · 33 ground-truth boutons",
  headline:
    "The fine-tuned MicroSAM Large checkpoint recovered every bouton — perfect recall — and posted the highest matched-instance mIoU of any model evaluated, ahead of three SOTA 3D backbones and far ahead of the lab's current Imaris workflow. The Base variant matches that recall and gives up only 0.016 mIoU while cutting false positives from 16 to 6, which is why the card recommends it when GPU memory is tight.",
  rwpqNote:
    "RWPQ = recall-weighted panoptic quality (PQ_rec). Figures are the deconvolved All-PSF condition; the full evaluation set spans 61 ground-truth instances across the two held-out specimens.",
  source: "https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation",
};
