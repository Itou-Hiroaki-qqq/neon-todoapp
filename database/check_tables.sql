-- テーブルが正しく作成されたか確認するSQL
-- NeonのSQL Editorで実行してください

-- todosテーブルの存在確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'todos';

-- todosテーブルの構造確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'todos'
ORDER BY ordinal_position;


