export const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

export function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180
}

export default async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const maxSize = Math.max(image.width, image.height)
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2))

    // set each dimensions to double largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by canvas context
    canvas.width = safeArea
    canvas.height = safeArea

    // translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2)
    ctx.rotate(getRadianAngle(rotation))
    ctx.translate(-safeArea / 2, -safeArea / 2)

    // draw rotated image and store data.
    ctx.drawImage(
        image,
        safeArea / 2 - image.width / 2,
        safeArea / 2 - image.height / 2
    )

    const data = ctx.getImageData(0, 0, safeArea, safeArea)

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
    )

    // RESIZE TO MAX 400x400 FOR OPTIMIZATION
    const TARGET_SIZE = 400;
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    
    // Calculate aspect ratio for resize (since it's a square crop, it's 1:1, but doing it safely)
    let finalWidth = canvas.width;
    let finalHeight = canvas.height;
    
    if (finalWidth > TARGET_SIZE || finalHeight > TARGET_SIZE) {
        if (finalWidth > finalHeight) {
            finalHeight = Math.floor((finalHeight / finalWidth) * TARGET_SIZE);
            finalWidth = TARGET_SIZE;
        } else {
            finalWidth = Math.floor((finalWidth / finalHeight) * TARGET_SIZE);
            finalHeight = TARGET_SIZE;
        }
    }

    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    
    // Fill with white background to handle zoomed-out images nicely
    finalCtx.fillStyle = '#ffffff';
    finalCtx.fillRect(0, 0, finalWidth, finalHeight);
    
    finalCtx.drawImage(canvas, 0, 0, finalWidth, finalHeight);

    // As a blob, optimized as WebP
    return new Promise((resolve) => {
        finalCanvas.toBlob((file) => {
            if (file) {
                // Return a File object instead of a blob, so we can upload it
                const croppedFile = new File([file], "cropped_image.webp", { type: "image/webp", lastModified: Date.now() });
                resolve(croppedFile)
            }
        }, 'image/webp', 0.85) // 0.85 quality for webp
    })
}
