// Numbers here come from the published model card:
// https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation
//
// The evaluation prioritises RECALL, matched-instance mIoU, and recall-weighted
// panoptic quality, because a missed bouton is a permanent counting error while a
// false positive can be filtered downstream. That is why there is no Dice column:
// the card does not report per-pixel Dice, and inventing one would defeat the
// entire point of the metric guard. Test set: 2 specimens, 61 GT instances.

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
    variant: "vit_l_lm",
    selected: true,
    recall: "61 / 61",
    miou: "0.758",
    rwpq: "0.787",
    fp: "30",
  },
  {
    name: "MicroSAM Base",
    variant: "vit_b_lm",
    recall: "61 / 61",
    miou: "0.755",
    rwpq: "0.771",
    fp: "12",
  },
  { name: "CellposeSAM", role: "baseline · did not lead on recall or mIoU" },
  { name: "Swin UNETR", role: "baseline · did not lead on recall or mIoU" },
  { name: "nnU-Net", role: "baseline · did not lead on recall or mIoU" },
  {
    name: "Imaris",
    variant: "semi-manual",
    role: "the lab's current hand workflow · the thing being replaced",
  },
];

export const thesisResultsMeta = {
  testSet: "2 specimens, 61 ground-truth bouton instances",
  headline:
    "The Large checkpoint recovered every bouton and posted the highest matched-instance mIoU of any model evaluated. Base gives up 0.003 mIoU to more than halve the false positives, which is why the card recommends it when GPU memory is tight.",
  rwpqNote: "RWPQ = recall-weighted panoptic quality, deconvolved-condition matched pair.",
  source: "https://huggingface.co/aditya0701/Drosophilla_melanogaster_Bouton_3d_segmentation",
};
