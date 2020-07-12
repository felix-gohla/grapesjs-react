import GrapesJS, {Editor as IEditor} from 'grapesjs';
import mjml from 'grapesjs-mjml';
import newsletter from 'grapesjs-preset-newsletter';
import webpage from 'grapesjs-preset-webpage';
import React, {PropsWithChildren} from 'react';

export type SupportedPresetType = 'webpage' | 'newsletter' | 'mjml';

const presets: Record<SupportedPresetType, any> = {
  webpage,
  newsletter,
  mjml,
};

export interface I18N {
  locale?: string;
  detectLocale?: boolean;
  localeFallback?: string;
  messages?: any;
}

export interface EditorProps {
  id: string;

  presetType?: SupportedPresetType;

  plugins?: (string | { (editor: any): void; })[];

  storageManager?: any;

  blockManager?: any;

  styleManager?: {};

  width?: string | number;

  height?: string | number;

  components?: object[];

  blocks?: object[];

  i18n?: I18N;

  onInit?(editor: IEditor): void;

  onDestroy?(editor: IEditor): void;
}

const Editor = React.forwardRef<IEditor | null, PropsWithChildren<EditorProps>>(
  (props, ref) => {
    const {
      blockManager,
      children,
      height,
      i18n,
      id,
      onDestroy,
      onInit,
      plugins: propPlugins,
      presetType,
      storageManager,
      styleManager,
      width,
    } = props;

    const [editor, setEditor] = React.useState<IEditor | null>(null);

    React.useEffect(
      () => {
        const editor = GrapesJS.init({
          container: `#${id}`,
          fromElement: true,
          blockManager,
          styleManager,
          storageManager,
          width,
          height,
          i18n,
          plugins: [
            presets[presetType],
            ...propPlugins,
          ],
        });
        if (typeof onInit === 'function') {
          onInit(editor);
        }
        setEditor(editor);

        return function cleanup() {
          if (editor) {
            if (typeof onDestroy === 'function') {
              onDestroy(editor);
            }
            GrapesJS.editors = GrapesJS.editors.filter((e: any) => e !== editor);
            editor.destroy();
            if (document) {
              const container: HTMLDivElement = document.getElementById(id) as HTMLDivElement;
              if (container) {
                container.innerHTML = '';
              }
            }
          }
        };
      },
      [blockManager, height, id, onDestroy, onInit, presetType, propPlugins, storageManager, styleManager, width],
    );

    React.useImperativeHandle(ref, () => {
      return editor;
    });

    return (
      <div id={id}>
        {children}
      </div>
    );
  },
);

Editor.defaultProps = {
  id: 'grapesjs-react-editor',
  presetType: 'newsletter',
  plugins: [],
  blocks: [],
  blockManager: {},
  storageManager: {},
  styleManager: {},
  width: 'auto',
  height: '100vh',
  components: [],
};

export default Editor;

(window as any).GrapesJS = GrapesJS;
