import Joi from "@hapi/joi";

export const quest = async ctx => {
	//새로운 quest 생성
	const schema = Joi.object().keys({
		taskName
	})
}

export const request = async ctx => {
	//퀘스트 변경 및 전달
}

export const terminate = async ctx => {
	//퀘스트 종결
}

export const onProgress = async ctx => {
	//퀘스트 수락 및 진행
}

export const complete = async ctx => {
	//퀘스트 요청사항 수행 완료
}

export const remove = async ctx => {
	//퀘스트 삭제
}

export const readOne = async ctx => {
	//퀘스트 정보 조회
}

export const readAll = async ctx => {
	//퀘스트 정보 조회
}
