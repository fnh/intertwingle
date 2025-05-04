export type GlobalProperties = {
    url: string,
    title: string,
    author: string
};

export type WebsiteModel = {
    pages: Array<PageModel | PageModelExtended>
    globalProperties: GlobalProperties
}


export type TemplatePage = { name: string, content: string }

export type WebsiteContent = { // TODO FIND APPROPRIATE NAME!!!
    contentPages: Array<PageModelExtended>,
    templatesMeta: Array<TemplatePage>,
    metamodel: WebsiteModel
}

export type PageSource = {
    page: PageModelExtended,
    templatesMeta: Array<TemplatePage>,
    metamodel: WebsiteModel
}


export type PageModel = {
    fileType: "static-asset",
    inputDirectory: string,
    filename: string,
    outputPath: string,
    outputDirectory: string,
    outfileRelativeToOutDir: string,
    isTemplate: false
}

export type PageModelExtended = {
    changedModel?: boolean;
    fileType?: string
    
    inputDirectory: string,
    filename: string,
    fileContent: string,
    fullQualifiedURL: string,
    
    title: string,
    textContent: string,
    isPublished: boolean,
    publicationDate: string | undefined,
    category: string,
    topics: Array<string>,
    wordCount: number,
    links: {
        internal: Array<string>, 
        external: Array<string>,
    },
    isTemplate: boolean,
    outdir: string,
    outputDirectory: string,
    outputPath: string,
    outfileRelativeToOutDir: string,
    backlinks?: Array<{url: string, title: string}>
    template?: string
/**
 {

        isTemplate,

        outdir,
        outputDirectory: outdir,
        outputPath,
        outfileRelativeToOutDir,

    }
 */
}

export type ClassifiedModel = {
    staticAssets: Array<PageModel>, 
    templates: Array<PageModelExtended>, 
    contentPages: Array<PageModelExtended>
}
