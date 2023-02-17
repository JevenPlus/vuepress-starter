set -e
echo "脚本执行"

# git add .
# git commit -m '更新知识库'
# git push -f https://github.com/JevenPlus/vuepress-starter.git
# git push -f http://192.168.20.17:8089/ninggangliu/wyd-frontend-wiki.git

# 生成静态文件
npm run build:docs

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'
git push -f https://github.com/JevenPlus/vuepress-starter.git main:gh-pages

cd -